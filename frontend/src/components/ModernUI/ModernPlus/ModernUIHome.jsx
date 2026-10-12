import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import '../../../css/Modern_HomePageCSS.css'
import ModernProfileBox from '../ModernHome/ModernProfileBox.jsx';
import ModernQuickSettings from '../ModernHome/ModernQuickSettings.jsx';
import ModernQuickNotes from '../ModernHome/ModernQuickNotes.jsx';
import ModernImportantJobs from '../ModernHome/ModernImportantJobs.jsx';
import ModernRecentLists from '../ModernHome/ModernRecentLists.jsx';
import ModernStatsChart from '../ModernHome/ModernStatsChart.jsx';
import ModernStatsInfo from '../ModernHome/ModernStatsInfo.jsx';
import ModernNewListPopup from '../ModernTracker/ModernNewListPopup.jsx';
import ModernFeedbackPopup from '../ModernTracker/ModernFeedbackPopup.jsx';
import ModernProfileSetupPopup from '../ModernHome/ModernProfileSetupPopup.jsx';

const normalizeCareerTitleValue = (careerTitleValue) => {
    if (typeof careerTitleValue === 'string') {
        return careerTitleValue;
    }

    if (Array.isArray(careerTitleValue)) {
        return careerTitleValue.join(',');
    }

    if (careerTitleValue == null) {
        return '';
    }

    return String(careerTitleValue);
};

const HOME_WIDGETS = ['profile', 'settings', 'notes', 'important', 'recent', 'chart', 'info'];
const RESIZABLE_WIDGETS = new Set(['settings', 'notes', 'recent']);
const RESIZE_LIMITS = {
    settings: { minW: 160, lockH: true },
    notes: { minW: 160, minH: 140, maxW: 560, maxH: 480 },
    recent: { minW: 220, minH: 120, fitContentH: true },
};

const recentContentHeight = (board) => {
    const root = board?.querySelector('[data-home-widget="recent"] .modernRecentListsContainer');
    const title = root?.querySelector('.modernRecentListsTitle');
    const buttons = root?.querySelector('.modernRecentListsButtonContainer');
    if (!root || !title || !buttons) {
        return null;
    }
    const titleStyle = window.getComputedStyle(title);
    const rootStyle = window.getComputedStyle(root);
    const titleBlock = title.offsetHeight
        + (parseFloat(titleStyle.marginTop) || 0)
        + (parseFloat(titleStyle.marginBottom) || 0);
    const chrome = (parseFloat(rootStyle.paddingTop) || 0)
        + (parseFloat(rootStyle.paddingBottom) || 0)
        + (parseFloat(rootStyle.borderTopWidth) || 0)
        + (parseFloat(rootStyle.borderBottomWidth) || 0);
    return Math.ceil(titleBlock + buttons.offsetHeight + chrome);
};

const heightCapFor = (id, board, boardMaxH) => {
    const limits = RESIZE_LIMITS[id];
    let cap = boardMaxH;
    if (limits?.maxH != null) {
        cap = Math.min(cap, limits.maxH);
    }
    if (limits?.fitContentH) {
        const content = recentContentHeight(board);
        if (content) {
            cap = Math.min(cap, content);
        }
    }
    return cap;
};

const HOME_WIDGET_UNITS = {
    profile: { w: 500, h: 135 },
    settings: { w: 225, h: 250 },
    notes: { w: 225, h: 340 },
    important: { w: 850, h: 521 },
    recent: { w: 850, h: 219 },
    chart: { w: 530, h: 338 },
    info: { w: 530, h: 338 },
};

const measureHomeWidgetSizes = (boardWidth) => {
    const unit = Math.max(0, boardWidth - 20) / 1880;
    return Object.fromEntries(
        Object.entries(HOME_WIDGET_UNITS).map(([id, size]) => [id, {
            w: Math.max(120, Math.round(size.w * unit)),
            h: size.h,
        }])
    );
};

const HOME_SNAP_PX = 16;
const HOME_GAP = 10;

const buildDefaultPositions = (sizes) => {
    const gap = HOME_GAP;
    const profile = { x: 0, y: 0 };
    const settings = {
        x: Math.max(0, sizes.profile.w - sizes.settings.w),
        y: sizes.profile.h + gap,
    };
    const notes = {
        x: settings.x,
        y: settings.y + sizes.settings.h + gap,
    };
    const important = { x: sizes.profile.w + gap, y: 0 };
    const recent = { x: important.x, y: sizes.important.h + gap };
    const chart = { x: important.x + sizes.important.w + gap, y: 0 };
    const info = { x: chart.x, y: sizes.chart.h + gap };
    return { profile, settings, notes, important, recent, chart, info };
};

const widgetRect = (id, positions, sizes) => ({
    x: positions[id].x,
    y: positions[id].y,
    w: sizes[id].w,
    h: sizes[id].h,
});

const rectsOverlap = (a, b, gap = 0) => (
    a.x < b.x + b.w + gap
    && a.x + a.w + gap > b.x
    && a.y < b.y + b.h + gap
    && a.y + a.h + gap > b.y
);

const rectFitsBoard = (rect, boardWidth, boardHeight) => (
    rect.x >= 0
    && rect.y >= 0
    && rect.x + rect.w <= boardWidth + 0.5
    && rect.y + rect.h <= boardHeight + 0.5
);

const clampRectToBoard = (x, y, width, height, boardWidth, boardHeight) => ({
    x: clampNumber(x, 0, Math.max(0, boardWidth - width)),
    y: clampNumber(y, 0, Math.max(0, boardHeight - height)),
});

const sideCandidates = (anchor, size, side, boardWidth, boardHeight) => {
    const spots = [];
    if (side === 'left' || side === 'right') {
        const x = side === 'left' ? anchor.x - size.w - HOME_GAP : anchor.x + anchor.w + HOME_GAP;
        if (x < 0 || x + size.w > boardWidth) {
            return spots;
        }
        const maxY = Math.max(0, boardHeight - size.h);
        const alignedYs = [
            clampNumber(anchor.y, 0, maxY),
            clampNumber(anchor.y + anchor.h - size.h, 0, maxY),
        ];
        for (let y = 0; y <= maxY; y += 8) {
            alignedYs.push(y);
        }
        alignedYs.forEach((y) => {
            const rect = { x, y, w: size.w, h: size.h };
            if (rectFitsBoard(rect, boardWidth, boardHeight)) {
                spots.push(rect);
            }
        });
        return spots;
    }

    const y = side === 'top' ? anchor.y - size.h - HOME_GAP : anchor.y + anchor.h + HOME_GAP;
    if (y < 0 || y + size.h > boardHeight) {
        return spots;
    }
    const maxX = Math.max(0, boardWidth - size.w);
    const alignedXs = [
        clampNumber(anchor.x, 0, maxX),
        clampNumber(anchor.x + anchor.w - size.w, 0, maxX),
    ];
    for (let x = 0; x <= maxX; x += 8) {
        alignedXs.push(x);
    }
    alignedXs.forEach((x) => {
        const rect = { x, y, w: size.w, h: size.h };
        if (rectFitsBoard(rect, boardWidth, boardHeight)) {
            spots.push(rect);
        }
    });
    return spots;
};

const pickClearSpot = (size, placed, boardWidth, boardHeight, prefer, anchor) => {
    const spots = [];
    const addSpot = (x, y) => {
        const rect = { x, y, w: size.w, h: size.h };
        if (rectFitsBoard(rect, boardWidth, boardHeight)) {
            spots.push(rect);
        }
    };

    ['left', 'right', 'top', 'bottom'].forEach((side) => {
        sideCandidates(anchor, size, side, boardWidth, boardHeight).forEach((rect) => spots.push(rect));
    });
    placed.forEach((item) => {
        addSpot(item.x + item.w + HOME_GAP, item.y);
        addSpot(item.x - size.w - HOME_GAP, item.y);
        addSpot(item.x, item.y + item.h + HOME_GAP);
        addSpot(item.x, item.y - size.h - HOME_GAP);
    });

    const maxX = Math.max(0, boardWidth - size.w);
    const maxY = Math.max(0, boardHeight - size.h);
    for (let y = 0; y <= maxY; y += 4) {
        for (let x = 0; x <= maxX; x += 4) {
            addSpot(x, y);
        }
    }

    const choose = (gap) => {
        let best = null;
        let bestDistance = Infinity;
        spots.forEach((rect) => {
            if (placed.some((item) => rectsOverlap(rect, item, gap))) {
                return;
            }
            const distance = Math.hypot(rect.x - prefer.x, rect.y - prefer.y);
            if (distance < bestDistance) {
                best = rect;
                bestDistance = distance;
            }
        });
        return best;
    };

    return choose(HOME_GAP) || choose(0);
};

const snapToNeighborSides = (x, y, width, height, others, boardWidth, boardHeight) => {
    const xTargets = [0, Math.max(0, boardWidth - width)];
    const yTargets = [0, Math.max(0, boardHeight - height)];
    others.forEach((item) => {
        xTargets.push(item.x - width - HOME_GAP, item.x + item.w + HOME_GAP);
        yTargets.push(item.y - height - HOME_GAP, item.y + item.h + HOME_GAP);
    });

    let nextX = x;
    let nextY = y;
    let bestX = HOME_SNAP_PX + 1;
    let bestY = HOME_SNAP_PX + 1;
    xTargets.forEach((target) => {
        const distance = Math.abs(x - target);
        if (distance <= HOME_SNAP_PX && distance < bestX) {
            bestX = distance;
            nextX = target;
        }
    });
    yTargets.forEach((target) => {
        const distance = Math.abs(y - target);
        if (distance <= HOME_SNAP_PX && distance < bestY) {
            bestY = distance;
            nextY = target;
        }
    });

    return clampRectToBoard(nextX, nextY, width, height, boardWidth, boardHeight);
};

const settleHomePositions = (positions, sizes, dragId, pixelX, pixelY, boardWidth, boardHeight) => {
    const size = sizes[dragId];
    if (!size || !positions[dragId]) {
        return null;
    }

    const others = HOME_WIDGETS
        .filter((id) => id !== dragId)
        .map((id) => widgetRect(id, positions, sizes));
    const snapped = snapToNeighborSides(pixelX, pixelY, size.w, size.h, others, boardWidth, boardHeight);
    const dragRect = { ...snapped, w: size.w, h: size.h };
    const next = { ...positions, [dragId]: { x: snapped.x, y: snapped.y } };
    const placed = [dragRect];
    const covered = [];

    HOME_WIDGETS.forEach((id) => {
        if (id === dragId) {
            return;
        }
        const rect = widgetRect(id, positions, sizes);
        if (rectsOverlap(dragRect, rect)) {
            covered.push(id);
        } else {
            placed.push(rect);
        }
    });

    covered
        .sort((a, b) => (sizes[a].w * sizes[a].h) - (sizes[b].w * sizes[b].h))
        .forEach((id) => {
            const previous = widgetRect(id, positions, sizes);
            const spot = pickClearSpot(sizes[id], placed, boardWidth, boardHeight, previous, dragRect);
            if (!spot) {
                return;
            }
            next[id] = { x: spot.x, y: spot.y };
            placed.push({ ...spot, w: sizes[id].w, h: sizes[id].h });
        });

    HOME_WIDGETS.forEach((id) => {
        if (id === dragId) {
            return;
        }
        const rect = { x: next[id].x, y: next[id].y, w: sizes[id].w, h: sizes[id].h };
        const index = placed.findIndex((item) => item.x === rect.x && item.y === rect.y && item.w === rect.w && item.h === rect.h);
        const others = placed.filter((_, itemIndex) => itemIndex !== index);
        if (!others.some((item) => rectsOverlap(rect, item, 0))) {
            return;
        }
        const spot = pickClearSpot(sizes[id], others, boardWidth, boardHeight, rect, dragRect);
        if (!spot) {
            return;
        }
        next[id] = { x: spot.x, y: spot.y };
        if (index >= 0) {
            placed[index] = { ...spot, w: sizes[id].w, h: sizes[id].h };
        }
    });

    const moved = HOME_WIDGETS.some((id) => (
        Math.abs(next[id].x - positions[id].x) > 0.5
        || Math.abs(next[id].y - positions[id].y) > 0.5
    ));
    return moved ? next : null;
};

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const isMissingRequiredProfileFields = (user) => {
    const normalizedCareerTitle = normalizeCareerTitleValue(user?.careerTitle)
        .replace(/[{}"]/g, '')
        .trim();

    const normalizedLocation = typeof user?.location === 'string'
        ? user.location.trim()
        : '';

    return !normalizedCareerTitle || !normalizedLocation;
};

function ModernUIHome({ onOpenUpdates }) { 
    const navigate = useNavigate();

  const [allJobs, setAllJobs] = useState([]);
    const [isJobsLoading, setIsJobsLoading] = useState(true);
    const [showNewListPopup, setShowNewListPopup] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [showProfileSetupPopup, setShowProfileSetupPopup] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState([]);
  const [userInfo, setUserInfo] = useState();
  const [widgetSizes, setWidgetSizes] = useState(() => measureHomeWidgetSizes(1200));
  const [homePositions, setHomePositions] = useState(() => buildDefaultPositions(measureHomeWidgetSizes(1200)));
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const [isResizingWidget, setIsResizingWidget] = useState(false);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const customSizesRef = useRef({});
  const liftedRef = useRef(null);
  const homePositionsRef = useRef(homePositions);
  const widgetSizesRef = useRef(widgetSizes);
  const boardRef = useRef(null);
  const normalizeCompanyKey = (name) => (name ?? '').trim().toLowerCase();

  useEffect(() => {
        homePositionsRef.current = homePositions;
  }, [homePositions]);

  useEffect(() => {
        widgetSizesRef.current = widgetSizes;
  }, [widgetSizes]);

  useEffect(() => {
        const measure = () => {
            const board = boardRef.current;
            if (!board?.clientWidth || !board?.clientHeight) {
                return;
            }
            const nextSizes = measureHomeWidgetSizes(board.clientWidth);
            Object.entries(customSizesRef.current).forEach(([id, size]) => {
                const limits = RESIZE_LIMITS[id];
                if (!limits || !nextSizes[id]) {
                    return;
                }
                const pos = homePositionsRef.current[id] || { x: 0, y: 0 };
                const boardMaxW = Math.max(limits.minW, board.clientWidth - pos.x);
                const maxW = Math.min(boardMaxW, limits.maxW ?? boardMaxW);
                const boardMaxH = Math.max(limits.minH ?? nextSizes[id].h, board.clientHeight - pos.y);
                const maxH = heightCapFor(id, board, boardMaxH);
                const minH = Math.min(limits.minH ?? nextSizes[id].h, maxH);
                nextSizes[id] = {
                    w: clampNumber(size.w, limits.minW, maxW),
                    h: limits.lockH
                        ? nextSizes[id].h
                        : clampNumber(size.h, minH, maxH),
                };
            });
            if (nextSizes.recent && RESIZE_LIMITS.recent.fitContentH) {
                const pos = homePositionsRef.current.recent || { x: 0, y: 0 };
                const boardMaxH = Math.max(RESIZE_LIMITS.recent.minH, board.clientHeight - pos.y);
                const maxH = heightCapFor('recent', board, boardMaxH);
                const minH = Math.min(RESIZE_LIMITS.recent.minH, maxH);
                nextSizes.recent = {
                    ...nextSizes.recent,
                    h: clampNumber(nextSizes.recent.h, minH, maxH),
                };
            }
            setWidgetSizes(nextSizes);
            setHomePositions((current) => {
                const next = {};
                HOME_WIDGETS.forEach((id) => {
                    next[id] = clampRectToBoard(
                        current[id]?.x ?? 0,
                        current[id]?.y ?? 0,
                        nextSizes[id].w,
                        nextSizes[id].h,
                        board.clientWidth,
                        board.clientHeight
                    );
                });
                return next;
            });
        };

        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
        if (!isDraggingWidget) {
            return undefined;
        }

        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = 'grabbing';

        const moveWidget = (event) => {
            const drag = dragRef.current;
            if (!drag) {
                return;
            }

            const board = boardRef.current;
            const sizes = widgetSizesRef.current;
            const size = sizes?.[drag.id];
            if (!board || !size) {
                return;
            }

            const bounds = board.getBoundingClientRect();
            const pixelX = event.clientX - drag.offsetX - bounds.left;
            const pixelY = event.clientY - drag.offsetY - bounds.top;
            const others = HOME_WIDGETS
                .filter((id) => id !== drag.id)
                .map((id) => widgetRect(id, homePositionsRef.current, sizes));
            const snapped = snapToNeighborSides(pixelX, pixelY, size.w, size.h, others, bounds.width, bounds.height);
            drag.boardX = snapped.x;
            drag.boardY = snapped.y;
            drag.x = bounds.left + snapped.x;
            drag.y = bounds.top + snapped.y;
            if (liftedRef.current) {
                liftedRef.current.style.left = `${drag.x}px`;
                liftedRef.current.style.top = `${drag.y}px`;
            }
        };

        const endDrag = () => {
            const drag = dragRef.current;
            const board = boardRef.current;
            const sizes = widgetSizesRef.current;
            if (drag && board && sizes?.[drag.id] && Number.isFinite(drag.boardX)) {
                const bounds = board.getBoundingClientRect();
                const next = settleHomePositions(
                    homePositionsRef.current,
                    sizes,
                    drag.id,
                    drag.boardX,
                    drag.boardY,
                    bounds.width,
                    bounds.height
                );
                if (next) {
                    homePositionsRef.current = next;
                    setHomePositions(next);
                }
            }
            dragRef.current = null;
            setIsDraggingWidget(false);
        };

        window.addEventListener('pointermove', moveWidget);
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
        return () => {
            document.body.style.cursor = previousCursor;
            window.removeEventListener('pointermove', moveWidget);
            window.removeEventListener('pointerup', endDrag);
            window.removeEventListener('pointercancel', endDrag);
        };
  }, [isDraggingWidget]);

  useEffect(() => {
        if (!isResizingWidget) {
            return undefined;
        }

        const previousCursor = document.body.style.cursor;
        document.body.style.cursor = resizeRef.current?.axis === 'x' ? 'ew-resize' : 'nwse-resize';

        const resizeWidget = (event) => {
            const resize = resizeRef.current;
            const board = boardRef.current;
            if (!resize || !board) {
                return;
            }

            const limits = RESIZE_LIMITS[resize.id];
            const boardMaxW = Math.max(limits.minW, board.clientWidth - resize.x);
            const maxW = Math.min(boardMaxW, limits.maxW ?? boardMaxW);
            const boardMaxH = Math.max(limits.minH ?? resize.startH, board.clientHeight - resize.y);
            const maxH = heightCapFor(resize.id, board, boardMaxH);
            const minH = Math.min(limits.minH ?? resize.startH, maxH);
            const nextSize = {
                w: clampNumber(resize.startW + (event.clientX - resize.startX), limits.minW, maxW),
                h: limits.lockH
                    ? resize.startH
                    : clampNumber(resize.startH + (event.clientY - resize.startY), minH, maxH),
            };
            const nextSizes = { ...widgetSizesRef.current, [resize.id]: nextSize };
            widgetSizesRef.current = nextSizes;
            customSizesRef.current = { ...customSizesRef.current, [resize.id]: nextSize };
            setWidgetSizes(nextSizes);
        };

        const endResize = () => {
            const resize = resizeRef.current;
            const board = boardRef.current;
            const sizes = widgetSizesRef.current;
            if (resize && board && sizes?.[resize.id]) {
                const next = settleHomePositions(
                    homePositionsRef.current,
                    sizes,
                    resize.id,
                    resize.x,
                    resize.y,
                    board.clientWidth,
                    board.clientHeight
                );
                if (next) {
                    homePositionsRef.current = next;
                    setHomePositions(next);
                }
            }
            resizeRef.current = null;
            setIsResizingWidget(false);
        };

        window.addEventListener('pointermove', resizeWidget);
        window.addEventListener('pointerup', endResize);
        window.addEventListener('pointercancel', endResize);
        return () => {
            document.body.style.cursor = previousCursor;
            window.removeEventListener('pointermove', resizeWidget);
            window.removeEventListener('pointerup', endResize);
            window.removeEventListener('pointercancel', endResize);
        };
  }, [isResizingWidget]);

  const startWidgetResize = (widgetId, event) => {
        if (event.button !== 0) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        const size = widgetSizesRef.current[widgetId];
        const pos = homePositionsRef.current[widgetId];
        if (!size || !pos) {
            return;
        }
        resizeRef.current = {
            id: widgetId,
            axis: RESIZE_LIMITS[widgetId]?.lockH ? 'x' : 'both',
            startX: event.clientX,
            startY: event.clientY,
            startW: size.w,
            startH: size.h,
            x: pos.x,
            y: pos.y,
        };
        setIsResizingWidget(true);
  };

  const startWidgetDrag = (widgetId, event) => {
        if (event.button !== 0) {
            return;
        }

        const card = event.currentTarget.closest('[data-home-widget]');
        if (!card) {
            return;
        }

        const rect = card.getBoundingClientRect();
        dragRef.current = {
            id: widgetId,
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
        };
        setIsDraggingWidget(true);
        event.preventDefault();
  };

  const handleFavoriteChanged = (companyName, nextFavorited) => {
        setAllJobs((prevJobs) => {
            if (!Array.isArray(prevJobs)) return prevJobs;
            return prevJobs.map((job) => {
                const jobCompanyName = job.companyName ?? job.company;

                if (normalizeCompanyKey(jobCompanyName) !== normalizeCompanyKey(companyName)) {
                    return job;
                }

                return {
                    ...job,
                    favorite: nextFavorited,
                    favorited: nextFavorited,
                };
            });
        });
  };

  const handleStageChanged = (companyName, newStage) => {
        setAllJobs((prevJobs) => {
            if (!Array.isArray(prevJobs)) return prevJobs;
            return prevJobs.map((job) => {
                const jobCompanyName = job.companyName ?? job.company;

                if (normalizeCompanyKey(jobCompanyName) !== normalizeCompanyKey(companyName)) {
                    return job;
                }

                return {
                    ...job,
                    stage: newStage,
                };
            });
        });
  };

  const fetchAllJobs = async () => {
      setIsJobsLoading(true);
        const stage = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev";
        const url = `${stage}/Jobs/getByUsername?username=${localStorage.getItem("username")}`;
        const encode = window.btoa("admin:admin");

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': 'Basic ' + encode },
                method: "GET"
            });

            const data = await res.json();
            setAllJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setAllJobs([]);
        } finally {
            setIsJobsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllJobs();
    }, []);

        const toggleNewListPopup = () => {
            setShowNewListPopup(!showNewListPopup);
        };

        const onOpenFeedback = () => {
            setShowFeedbackPopup(!showFeedbackPopup);
        };

    const closeProfileSetupPopup = () => {
        const username = localStorage.getItem('username') || '';
        if (username) {
            localStorage.setItem(`profile-setup-prompt-seen:${username}`, 'true');
        }
        setShowProfileSetupPopup(false);
    };

    const onGoToSettingsFromProfilePrompt = () => {
        closeProfileSetupPopup();
        navigate('/settings');
    };

    useEffect(() => {
            let stage_url = "https://ax00jgr5uf.execute-api.us-east-1.amazonaws.com/dev"
            let url = stage_url + "/Users/getByUsername?username=" + localStorage.getItem('username')
            let encode = window.btoa("admin:admin");
            fetch(url, {
                headers: {
                    'Authorization':  'Basic ' + encode
                }}    
            )
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log("getting all applications from this month: " + JSON.stringify(result));
                                                const sourceUser = result?.body || result;
                                                const username = sourceUser?.username || localStorage.getItem('username') || '';
                                                const hasSeenPrompt = username
                                                    ? localStorage.getItem(`profile-setup-prompt-seen:${username}`) === 'true'
                                                    : false;

                                                if (!hasSeenPrompt && isMissingRequiredProfileFields(sourceUser)) {
                                                    const missing = [];
                                                    const normalizedTitle = normalizeCareerTitleValue(sourceUser?.careerTitle).replace(/[{}"]/g, '').trim();
                                                    const normalizedLocation = typeof sourceUser?.location === 'string' ? sourceUser.location.trim() : '';
                                                    if (!normalizedTitle) missing.push('career title');
                                                    if (!normalizedLocation) missing.push('location');
                                                    setMissingProfileFields(missing);
                                                    setShowProfileSetupPopup(true);
                                                }

                                                setUserInfo(sourceUser);
                    },
                    (error) => {
                        console.error('Failed to load user data:', error);
                    }
                )
        }, [])
    



    const renderHomeWidget = (id) => {
        switch (id) {
            case 'profile':
                return <ModernProfileBox userData={userInfo} />;
            case 'settings':
                return <ModernQuickSettings onOpenUpdates={onOpenUpdates} onOpenNewList={toggleNewListPopup} onOpenFeedback={onOpenFeedback} />;
            case 'notes':
                return <ModernQuickNotes userData={userInfo} />;
            case 'important':
                return <ModernImportantJobs importantJobsList={allJobs} importantJobsLoading={isJobsLoading} onFavoriteChanged={handleFavoriteChanged} onStageChanged={handleStageChanged} />;
            case 'recent':
                return <ModernRecentLists />;
            case 'chart':
                return <ModernStatsChart allJobs={allJobs} />;
            case 'info':
                return <ModernStatsInfo allJobs={allJobs} />;
            default:
                return null;
        }
    };

    const draggedWidgetId = isDraggingWidget ? dragRef.current?.id : null;

    return (
        <>
        <div className='modernHomeContainer' ref={boardRef}>
            {HOME_WIDGETS.map((id) => {
                const lifted = draggedWidgetId === id;
                const drag = dragRef.current;
                const size = widgetSizes[id];
                const pos = homePositions[id] || { x: 0, y: 0 };
                return (
                    <div
                        key={id}
                        data-home-widget={id}
                        className={lifted ? 'homeWidgetLifted' : 'homeCell homeFreeWidget'}
                        ref={lifted ? liftedRef : undefined}
                        style={lifted && drag ? {
                            left: drag.x,
                            top: drag.y,
                            width: drag.width,
                            height: drag.height,
                        } : {
                            left: pos.x,
                            top: pos.y,
                            width: size.w,
                            height: size.h,
                        }}
                    >
                        <button
                            type="button"
                            className="homeDragHandle"
                            aria-label="Drag to rearrange"
                            title="Drag to rearrange"
                            onPointerDown={(event) => startWidgetDrag(id, event)}
                        >
                            <GripVertical size={16} />
                        </button>
                        <div className="homeWidgetBody">
                            {renderHomeWidget(id)}
                        </div>
                        {RESIZABLE_WIDGETS.has(id) && !lifted ? (
                            <button
                                type="button"
                                className={RESIZE_LIMITS[id]?.lockH ? 'homeResizeHandle homeResizeHandleWidth' : 'homeResizeHandle'}
                                aria-label={RESIZE_LIMITS[id]?.lockH ? 'Resize width' : 'Resize'}
                                title={RESIZE_LIMITS[id]?.lockH ? 'Resize width' : 'Resize'}
                                onPointerDown={(event) => startWidgetResize(id, event)}
                            />
                        ) : null}
                    </div>
                );
            })}
        </div>
                    {showNewListPopup ? <ModernNewListPopup text='NewList' closePopup={toggleNewListPopup} /> : null }
                    {showFeedbackPopup ? <ModernFeedbackPopup closePopup={onOpenFeedback} /> : null }
                    {showProfileSetupPopup ? <ModernProfileSetupPopup closePopup={closeProfileSetupPopup} onGoToSettings={onGoToSettingsFromProfilePrompt} missingFields={missingProfileFields} /> : null }
        </>
    );
};

export default ModernUIHome;
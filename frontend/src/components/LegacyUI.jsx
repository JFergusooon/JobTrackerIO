

function LegacyUI() { 

    return (
        <>
            <div style={{width: '100%', height: '100vh', backgroundColor: 'green'}}>
                <p>LegacyUI</p>
                <div style={{display: 'flex'}}>
                    {/* Left Column*/}
                    <div style={{width: '20%', backgroundColor: 'gray', height: '100%'}}>
                        
                        
                        <div style={{backgroundColor: '#424242', display: 'flex'}}>
                            <div>
                                <p>Waiting: </p>
                                <p>1271</p>
                                {/*<p>{totalWaitingApps}</p>*/}
                            </div>

                            <div>
                                <p>Rejected: </p>
                                <p>538</p>
                                {/*<p>{totalRejectedApps}</p>*/}
                            </div>
                        </div>

                        <div>
                            <p>Search for Company:</p>
                            <button>Import from CSV</button>
                        </div>

                        <div>
                            <input></input>
                            <textarea></textarea>

                            <div>
                                <button>Search</button>
                                <button>New Application</button>
                            </div>
                        </div>

                        <div>
                            {/* Search Result Click */}
                        </div>

                        <div>
                            <p>--- List Management ---</p>
                            <p>Current List: Mar 2026</p>
                        </div>

                        {/* List Grid */}
                        <div></div>

                        <button>+ New List</button>
                        <button>Delete Current List</button>

                        {/*Applications Tools Popup */}
                    </div>

                    {/* Right Column*/}
                    <div style={{width: '80%', backgroundColor: 'lightblue'}}>
                        <p>Applications</p>

                        <div>
                            <p>Mar 2026 List</p>

                            <div>
                                <div>
                                    <p>Active Applications X</p>
                                </div>
                                <div>
                                    <p>Rejected Applications X</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LegacyUI;
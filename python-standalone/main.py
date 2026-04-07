import tkinter as tk
from tkinter import messagebox, simpledialog
import json
import os
import re
from tkinter import filedialog
from calendar import month_name

DATA_FILE = "C:/Users/Ferguson/Documents/applications.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
        if isinstance(data, list):
            data = {"lists": {"MASTER": data}, "current_list": "MASTER"}
            save_data(data)
        # Always force MASTER as the current list
        data["current_list"] = "MASTER"
        return data
    return {"lists": {"MASTER": []}, "current_list": "MASTER"}


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def detect_month_index(name):
    months = [m.lower() for m in month_name if m]  # month_name from calendar
    name_lower = name.lower()
    for i, m in enumerate(months, start=1):
        # Check full month name
        if m in name_lower:
            return i
        # Check first 3 letters
        if m[:3] in name_lower:
            return i
    return None



class JobAppGUI:
    def __init__(self, master):
        self.master = master
        self.master.title("Job Application Tracker")
        self.master.geometry("1280x680")

        self.data = load_data()
        self.lists = self.data["lists"]
        self.current_list = "Mar 2026"
        self.selected_company = None
        save_data({"lists": self.lists, "current_list": self.current_list})

        # ---------- Left and Right Layout ----------
        self.left_frame = tk.Frame(master)
        self.left_frame.pack(side="left", fill="y", padx=15, pady=15)
        self.right_frame = tk.Frame(master, relief="sunken", bd=2)
        self.right_frame.pack(side="right", fill="both", expand=True, padx=15, pady=15)

        self.total_frame = tk.Frame(self.left_frame, bg="#333333")

        # --- LEFT COLUMN (Waiting) ---
        left_col = tk.Frame(self.total_frame, bg="#333333")
        tk.Label(left_col, text="Waiting:", font=("Arial", 12), fg="white", bg="#333333").pack()

        self.waiting_total_label = tk.Label(
            left_col,
            text=self.getTotalWaitingApplications(),
            font=("Arial", 12),
            fg="green",
            bg="#333333"
        )
        self.waiting_total_label.pack()
        left_col.pack(side="left", padx=20)

        # --- RIGHT COLUMN (Rejected) ---
        right_col = tk.Frame(self.total_frame, bg="#333333")
        tk.Label(right_col, text="Rejected:", font=("Arial", 12), fg="white", bg="#333333").pack()

        self.rejected_total_label = tk.Label(
            right_col,
            text=self.getTotalRejectedApplications(),
            font=("Arial", 12),
            fg="red",
            bg="#333333"
        )
        self.rejected_total_label.pack()
        right_col.pack(side="left", padx=20)

        self.total_frame.pack(pady=5)

        tk.Label(self.left_frame, text="Search for Company:", font=("Arial", 12)).pack(pady=10)

        import_btn = tk.Button(self.left_frame, text="Import from CSV", command=self.import_from_csv)
        import_btn.pack(pady=5)

        # Search entry on top
        self.search_entry = tk.Entry(self.left_frame, width=35)
        self.search_entry.pack(pady=(0, 5))

        # Listbox for live search results
        self.search_results_box = tk.Listbox(self.left_frame, width=35, height=6)
        self.search_results_box.pack(pady=(0, 5))
        self.search_results_box.bind("<<ListboxSelect>>", self.handle_search_selection)

        # Bind typing to update results
        self.search_entry.bind("<KeyRelease>", self.live_search)

        # Horizontal frame for buttons
        button_frame = tk.Frame(self.left_frame)
        button_frame.pack(pady=5)

        search_btn = tk.Button(button_frame, text="Search", command=self.search_company)
        search_btn.pack(side="left", padx=(0, 5))

        self.new_button = tk.Button(button_frame, text="New Application", command=self.open_application_form)
        self.new_button.pack(side="left")
        # Buttons for company actions (hidden initially)
        self.reject_button = tk.Button(self.left_frame, text="Set Rejected / Not Rejected", command=self.toggle_rejected)
        self.edit_company_btn = tk.Button(self.left_frame, text="✏️ Edit Application", command=self.edit_application)
        self.delete_company_btn = tk.Button(self.left_frame, text="❌ Delete Company", command=self.delete_company)

        # Label to show search results or selection
        self.result_label = tk.Label(self.left_frame, text="", font=("Arial", 11))
        self.result_label.pack(pady=10)





        self.list_section_frame = tk.Frame(self.left_frame, bg="#333333")
        self.list_section_frame.pack(pady=5, fill="x")  # Fill horizontally

        tk.Label(self.list_section_frame, text="--- List Management ---", font=("Arial", 11, "bold"), bg="#333333",
                 fg="white").pack(pady=10)
        self.list_label = tk.Label(self.list_section_frame, text=f"Current List: {self.current_list}",
                                   font=("Arial", 12, "bold"), bg="#333333", fg="white")
        self.list_label.pack(pady=5)

        # Frame for the actual list buttons
        self.list_button_frame = tk.Frame(self.list_section_frame, bg="#333333")
        self.list_button_frame.pack(pady=5, fill="x")  # Now inside list_section_frame

        self.create_btn = tk.Button(self.list_section_frame, text="+ New List", command=self.create_new_list)
        self.create_btn.pack(pady=5)
        self.delete_btn = tk.Button(self.list_section_frame, text="Delete Current List", command=self.delete_list)
        self.delete_btn.pack(pady=5)

        tk.Label(self.right_frame, text="Applications", font=("Arial", 12, "bold")).pack(pady=5)

        # Canvas setup
        self.canvas = tk.Canvas(self.right_frame)

        # Vertical scrollbar
        self.v_scrollbar = tk.Scrollbar(self.right_frame, orient="vertical", command=self.canvas.yview)
        self.v_scrollbar.pack(side="right", fill="y")

        # Horizontal scrollbar
        self.h_scrollbar = tk.Scrollbar(self.right_frame, orient="horizontal", command=self.canvas.xview)
        self.h_scrollbar.pack(side="bottom", fill="x")

        # Scrollable frame inside the canvas
        self.scrollable_frame = tk.Frame(self.canvas)
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(
                scrollregion=self.canvas.bbox("all")
            )
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")

        # Connect scrollbars to canvas
        self.canvas.configure(yscrollcommand=self.v_scrollbar.set, xscrollcommand=self.h_scrollbar.set)

        # Pack the canvas (after scrollbars)
        self.canvas.pack(side="left", fill="both", expand=True)

        self.refresh_list_buttons()
        self.refresh_display()

    def update_canvas_height(self):
        self.canvas.update_idletasks()
        content_height = self.scrollable_frame.winfo_reqheight()
        self.canvas.config(height=content_height)

    def move_rejected_to_end(self, applications):
        """
        Reorders the applications list so that all rejected applications are at the end.
        Preserves the order of non-rejected and rejected items.
        """
        # Separate non-rejected and rejected
        non_rejected = [app for app in applications if not app.get('rejected', False)]
        rejected = [app for app in applications if app.get('rejected', False)]

        # Combine them: non-rejected first, rejected at the end
        return non_rejected + rejected

    # ---------- Search / Add / Toggle / Delete ----------
    def search_company(self):
        name = self.search_entry.get().strip()
        if not name:
            messagebox.showwarning("Empty Search", "Please enter a company name.")
            return

        found_app = None
        found_list = None
        # Look through all lists
        for lname, lapps in self.lists.items():
            for app in lapps:
                if app["company"].lower() == name.lower():
                    found_app = app
                    found_list = lname
                    break
            if found_app:
                break

        if found_app:
            self.switch_list(found_list)  # Go to the list automatically
            self.select_company(found_app)  # Select the company

            status = "REJECTED" if found_app.get("rejected") else "ACTIVE"
            color = "red" if found_app.get("rejected") else "green"

            # Insert newline before '(' for wrapping
            result_text = f"✅ Found: {name} ({status}, List: {found_list})"
            if "(" in result_text:
                idx = result_text.index("(")
                result_text = result_text[:idx] + "\n" + result_text[idx:]

            self.result_label.config(text=result_text, fg=color)
        else:
            self.result_label.config(text=f"❌ No record found for '{name}'.", fg="red")
            self.reject_button.config(state="disabled")
            self.edit_company_btn.config(state="disabled")
            self.delete_company_btn.config(state="disabled")
            self.selected_company = None

    def live_search(self, event=None):
        query = self.search_entry.get().strip().lower()
        self.search_results_box.delete(0, tk.END)

        if not query:
            return  # empty — hide suggestions

        # Search across ALL lists
        seen = set()
        results = []

        for lname, apps in self.lists.items():
            for app in apps:
                comp = app["company"].lower()
                if query in comp and comp not in seen:
                    results.append(app)
                    seen.add(comp)

        results = self.move_rejected_to_end(results)

        # Insert results
        for app in results:

            display = app["company"]
            color = "red" if app.get("rejected") else "black"
            self.search_results_box.insert(tk.END, display)
            self.search_results_box.itemconfig(tk.END, fg=color)

    def handle_search_selection(self, event):
        if not self.search_results_box.curselection():
            return

        index = self.search_results_box.curselection()[0]
        selected_text = self.search_results_box.get(index)
        company_name = selected_text.replace(" (R)", "")

        # Find the company object across lists
        for lname, apps in self.lists.items():
            for app in apps:
                if app["company"] == company_name:
                    self.switch_list(lname)
                    self.select_company(app)
                    self.search_entry.delete(0, tk.END)
                    self.search_entry.insert(0, company_name)

                    # Clear suggestions
                    self.search_results_box.delete(0, tk.END)
                    return

    def open_application_form(self, entry=None):
        parent = self.master

        is_edit = entry is not None

        win = tk.Toplevel(parent)
        win.title("Edit Application" if is_edit else "New Application")
        win.geometry("236x355")
        win.configure(bg="#e8edf2")
        win.grab_set()

        remote_var = tk.BooleanVar(
            value=(entry["location"] == "Remote") if is_edit else True
        )

        # ---------- Form Container ----------
        form_frame = tk.Frame(win, bg="white", bd=1, relief="solid")
        form_frame.columnconfigure(0, weight=1)
        form_frame.columnconfigure(1, weight=1)  # in case you add a second column later

        form_frame.pack(padx=15, pady=15, fill="both", expand=True)

        # ---------- Header ----------
        header = tk.Label(
            form_frame,
            text="Edit Job Application" if is_edit else "Add Job Application",
            font=("Arial", 13, "bold"),
            bg="#4a6fa5",
            fg="white",
            pady=6
        )
        header.grid(row=0, column=0, columnspan=2, sticky="ew")
        # ---------- Company ----------
        tk.Label(form_frame, text="Company Name:", bg="white").grid(row=1, column=0, sticky="w", padx=10, pady=(10, 0))
        company_entry = tk.Entry(form_frame, width=30)
        company_entry.grid(row=2, column=0, padx=10, sticky="ew")

        # ---------- Position ----------
        tk.Label(form_frame, text="Position:", bg="white").grid(row=3, column=0, sticky="w", padx=10, pady=(10, 0))
        position_entry = tk.Entry(form_frame, width=30)
        position_entry.grid(row=4, column=0, padx=10, sticky="ew")

        # ---------- Remote ----------
        tk.Label(form_frame, text="Remote / Location:", bg="white").grid(row=5, column=0, sticky="w", padx=10,
                                                                         pady=(10, 0))

        remote_checkbox = tk.Checkbutton(
            form_frame,
            text="Remote",
            variable=remote_var,
            bg="white",
            activebackground="white"
        )
        remote_checkbox.grid(row=6, column=0, sticky="w", padx=10)

        # ---------- Location ----------
        location_entry = tk.Entry(form_frame, width=30)

        def toggle_location():
            if remote_var.get():
                location_entry.grid_remove()
            else:
                location_entry.grid(row=7, column=0, padx=10, pady=3, sticky="ew")

        remote_checkbox.config(command=toggle_location)

        # ---------- Job Link ----------
        tk.Label(form_frame, text="Job Link:", bg="white").grid(row=8, column=0, sticky="w", padx=10, pady=(10, 0))
        joblink_entry = tk.Entry(form_frame, width=30)
        joblink_entry.grid(row=9, column=0, padx=10, sticky="ew")

        # ---------- Prefill values if editing ----------
        if is_edit:
            company_entry.insert(0, entry["company"])
            position_entry.insert(0, entry["position"])
            joblink_entry.insert(0, entry["joblink"])

            if entry["location"] != "Remote":
                location_entry.insert(0, entry["location"])
                location_entry.grid(row=7, column=0, padx=10, pady=3, sticky="ew")

        # ---------- Save ----------
        def save():
            company = company_entry.get().strip()
            position = position_entry.get().strip()
            joblink = joblink_entry.get().strip()
            location = "Remote" if remote_var.get() else location_entry.get().strip()

            if not company:
                messagebox.showwarning("Invalid Input", "Company name cannot be empty.", parent=win)
                return

            if is_edit:
                # Remove the app from its current list
                old_list_name = self.selected_company.get("list", self.current_list)
                if old_list_name in self.lists:
                    self.lists[old_list_name] = [
                        app for app in self.lists[old_list_name]
                        if app is not self.selected_company
                    ]

                # Update its data
                self.selected_company.update({
                    "company": company,
                    "position": position,
                    "joblink": joblink,
                    "location": location,
                    "list": "Mar 2026"  # Move to Mar 2026
                })

                # Add it to Mar 2026 list
                self.lists.setdefault("Mar 2026", []).append(self.selected_company)

            else:
                new_entry = {
                    "company": company,
                    "position": position,
                    "location": location,
                    "joblink": joblink,
                    "rejected": False,
                    "list": "Mar 2026"
                }
                self.lists.setdefault("Mar 2026", []).append(new_entry)

            save_data({
                "lists": self.lists,
                "current_list": self.current_list
            })

            self.refresh_display()
            self.refresh_totals()

            # Clear search entry
            self.search_entry.delete(0, tk.END)
            self.result_label.config(
                text="✅ Application updated." if is_edit else "✅ Application added.",
                fg="green"
            )

            win.destroy()

        save_btn = tk.Button(
            form_frame,
            text="Save Changes" if is_edit else "Add Application",
            command=save,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 10, "bold"),
            relief="flat",
            padx=10,
            pady=5
        )

        save_btn.grid(row=10, column=0, pady=15, sticky="ew")

    def toggle_rejected(self):
        if not self.selected_company:
            return
        self.selected_company["rejected"] = not self.selected_company.get("rejected", False)
        save_data({"lists": self.lists, "current_list": self.current_list})
        status = "REJECTED" if self.selected_company["rejected"] else "ACTIVE"
        color = "red" if self.selected_company["rejected"] else "green"
        self.result_label.config(text=f"{self.selected_company['company']} is now {status}.", fg=color)
        self.refresh_display()
        self.refresh_totals()

    def delete_company(self):
        if not self.selected_company:
            return

        name = self.selected_company["company"]

        # Prompt for password
        password = simpledialog.askstring("Password Required", f"Enter password to delete '{name}':", show="*")
        if password != "aria":  # <-- replace with your desired password
            messagebox.showerror("Incorrect Password", "The password is incorrect. Company was not deleted.")
            return

        confirm = messagebox.askyesno("Delete Company", f"Are you sure you want to remove '{name}' from all lists?")
        if not confirm:
            return

        # Delete from all lists
        for list_name, list_apps in self.lists.items():
            self.lists[list_name] = [a for a in list_apps if a["company"].lower() != name.lower()]

        self.selected_company = None
        self.search_entry.delete(0, tk.END)
        self.result_label.config(text=f"❌ Deleted {name}.", fg="red")

        # Disable buttons
        self.reject_button.config(state="disabled")
        self.edit_company_btn.config(state="disabled")
        self.delete_company_btn.config(state="disabled")

        save_data({"lists": self.lists, "current_list": self.current_list})
        self.refresh_display()
        self.refresh_totals()

    # ---------- List Management ----------
    def create_new_list(self):
        new_name = simpledialog.askstring("New List", "Enter a name for the new list:")
        if not new_name:
            return
        if new_name in self.lists:
            messagebox.showwarning("Duplicate", "A list with that name already exists.")
            return
        self.lists[new_name] = []
        self.current_list = new_name
        self.sort_lists()
        self.update_after_list_change()

    def delete_list(self):
        if self.current_list == "MASTER":
            messagebox.showwarning("Protected", "You cannot delete the MASTER list.")
            return

        # Prompt for password
        password = simpledialog.askstring("Password Required", "Enter password to delete this list:", show="*")
        if password != "aria":  # <-- replace with your desired password
            messagebox.showerror("Incorrect Password", "The password is incorrect. List was not deleted.")
            return

        confirm = messagebox.askyesno("Delete List", f"Are you sure you want to delete '{self.current_list}'?")
        if confirm:
            del self.lists[self.current_list]
            self.current_list = "MASTER"
            self.update_after_list_change()

    def switch_list(self, name):
        self.current_list = name
        self.update_after_list_change()

    def sort_lists(self):
        """Sort lists so MASTER is first, non-month lists next (alphabetically), then month-named lists in calendar order."""

        def sort_key(name):
            if name == "MASTER":
                return (0, 0, "")  # MASTER first
            month_index = detect_month_index(name)
            if month_index:
                return (2, month_index, "")  # Months last, in order
            return (1, 0, name.lower())  # Non-month custom lists, alphabetically

        self.lists = dict(sorted(self.lists.items(), key=lambda x: sort_key(x[0])))

    def edit_application(self):
        if not self.selected_company:
            return

        self.open_application_form(self.selected_company)

    def import_from_csv(self):
        file_path = filedialog.askopenfilename(
            title="Select CSV File",
            filetypes=[("CSV Files", "*.csv")]
        )
        if not file_path:
            return  # user canceled

        try:
            import csv
            imported_count = 0

            with open(file_path, newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    company = row.get("company", "").strip()
                    position = row.get("position", "").strip()
                    location = row.get("location", "").strip()
                    joblink = row.get("joblink", "").strip()
                    rejected = row.get("rejected", "").strip().lower() == "true"
                    list_name = row.get("list", "MASTER").strip() or "MASTER"

                    if not company:
                        continue  # skip empty rows

                    # Create entry
                    new_entry = {
                        "company": company,
                        "position": position,
                        "location": location,
                        "joblink": joblink,
                        "rejected": rejected,
                        "list": list_name
                    }

                    # Add entry to the specified list only
                    self.lists.setdefault(list_name, []).append(new_entry)

                    imported_count += 1

            save_data({"lists": self.lists, "current_list": self.current_list})
            self.refresh_list_buttons()
            self.refresh_display()
            self.refresh_totals()
            messagebox.showinfo("Import Complete", f"Imported {imported_count} applications successfully!")

        except Exception as e:
            messagebox.showerror("Import Failed", f"Error importing CSV:\n{e}")

    # ---------- Display ----------
    def refresh_display(self):
        for w in self.scrollable_frame.winfo_children():
            w.destroy()

        tk.Label(self.scrollable_frame, text=f"{self.current_list} List", font=("Arial", 11, "bold")).pack(pady=5)

        # Hide buttons
        self.reject_button.pack_forget()
        self.edit_company_btn.pack_forget()
        self.delete_company_btn.pack_forget()
        self.selected_company = None

        # Combine all lists if MASTER
        if self.current_list == "MASTER":
            apps = []
            for lname, lapps in self.lists.items():
                if lname != "MASTER":
                    apps.extend(lapps)
            # Remove duplicates by company name
            seen = set()
            unique_apps = []
            for a in apps:
                if a["company"].lower() not in seen:
                    unique_apps.append(a)
                    seen.add(a["company"].lower())
            apps = unique_apps
        else:
            apps = self.lists.get(self.current_list, [])

        if not apps:
            tk.Label(self.scrollable_frame, text="(No applications)", fg="gray").pack()
            return

        # Columns for Active vs Rejected
        col_frame = tk.Frame(self.scrollable_frame)
        col_frame.pack(fill="both", expand=True, padx=10)  # wider padding
        col_frame.columnconfigure(0, weight=1, minsize=50)  # Active column min width
        col_frame.columnconfigure(1, weight=1, minsize=50)

        left_frame = tk.Frame(col_frame)
        left_frame.grid(row=0, column=0, sticky="nsew", padx=5)
        tk.Label(left_frame, text="Active Applications (" + str(self.get_list_size(self.current_list, False)) + ")", font=("Arial", 10, "bold")).pack(pady=5, anchor="w")

        right_frame = tk.Frame(col_frame)
        right_frame.grid(row=0, column=1, sticky="nsew", padx=5)
        tk.Label(right_frame, text="Rejected Applications (" + str(self.get_list_size(self.current_list, True)) + ")", font=("Arial", 10, "bold")).pack(pady=5, anchor="w")

        for app in apps:
            fg_color = "red" if app.get("rejected") else "black"
            text_label = f"{app['company']} – {app['position']}"
            frame = right_frame if app.get("rejected") else left_frame

            label = tk.Label(
                frame,
                text=text_label,
                fg=fg_color,
                bg="SystemButtonFace",  # always default, no selection in MASTER
                anchor="w",
                justify="left",
                wraplength=350,
                cursor="hand2" if self.current_list != "MASTER" else ""
            )
            label.pack(fill="x", padx=5, pady=2)

            # Only make selectable if not MASTER
            if self.current_list != "MASTER":
                label.bind("<Button-1>", lambda e, comp=app: self.select_company(comp))
        self.update_canvas_height()

    def select_company(self, comp):
        self.selected_company = comp
        self.search_entry.delete(0, tk.END)
        self.search_entry.insert(0, comp["company"])
        color = "red" if comp["rejected"] else "green"
        self.result_label.config(text=f"Selected: {comp['company']}", fg=color)

        # Pack buttons if not already visible
        if not self.reject_button.winfo_ismapped():
            self.reject_button.pack(pady=5)
        if not self.edit_company_btn.winfo_ismapped():
            self.edit_company_btn.pack(pady=5)
        if not self.delete_company_btn.winfo_ismapped():
            self.delete_company_btn.pack(pady=5)

        # Enable the buttons
        self.reject_button.config(state="normal")
        self.edit_company_btn.config(state="normal")
        self.delete_company_btn.config(state="normal")

    def refresh_list_buttons(self):
        for w in self.list_button_frame.winfo_children():
            w.destroy()

        max_per_row = 3
        row = 0
        col = 0

        # Ensure MASTER is always first
        sorted_names = ["MASTER"] + [n for n in self.lists.keys() if n != "MASTER"]

        for name in sorted_names:
            color = "lightblue" if name == self.current_list else "SystemButtonFace"
            btn = tk.Button(
                self.list_button_frame,
                text=name,
                width=12,
                bg=color,
                command=lambda n=name: self.switch_list(n)
            )
            btn.grid(row=row, column=col, padx=3, pady=3, sticky="ew")

            col += 1
            if col >= max_per_row:
                col = 0
                row += 1

    def update_after_list_change(self):
        self.list_label.config(text=f"Current List: {self.current_list}")
        save_data({"lists": self.lists, "current_list": self.current_list})
        self.sort_lists()
        self.refresh_list_buttons()
        self.refresh_display()
        self.refresh_totals()

        # Hide delete button if MASTER is selected
        if self.current_list == "MASTER":
            self.delete_btn.pack_forget()
        else:
            if not self.delete_btn.winfo_ismapped():
                self.delete_btn.pack(pady=5)

    def getTotalWaitingApplications(self):
        return sum(
            1
            for applications in self.lists.values()
            for app in applications
            if not app.get("rejected", False)
        )

    def getTotalRejectedApplications(self):
        return sum(
            1
            for applications in self.lists.values()
            for app in applications
            if app.get("rejected", False)
        )

    def refresh_totals(self):
        self.waiting_total_label.config(text=self.getTotalWaitingApplications())
        self.rejected_total_label.config(text=self.getTotalRejectedApplications())

#   My Code:
    def get_list_size(self, list_name, rejected):
        """
        Return the number of applications in a given list,
        filtered by rejected status (True = rejected, False = not rejected).
        """
        if not os.path.exists(DATA_FILE):
            print(f"Error: {DATA_FILE} not found.")
            return 0

        try:
            with open(DATA_FILE, "r") as f:
                data = json.load(f)
        except json.JSONDecodeError:
            print("Error: JSON file is invalid.")
            return 0

        lists = data.get("lists", {})
        if list_name not in lists:
            print(f"List '{list_name}' not found.")
            return 0

        # Filter and count based on rejected status
        count = sum(1 for app in lists[list_name] if app.get("rejected") == rejected)
        return count




if __name__ == "__main__":
    root = tk.Tk()
    app = JobAppGUI(root)
    root.mainloop()

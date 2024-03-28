import tkinter as tk
from tkinter import messagebox
import json

# cmdline commands to package this script:
# pip install pyinstaller (optional; only if not already installed)
# pyinstaller --onefile --windowed path/thisscript.py

# Color scheme
color_primary = "#BFBFBF"
color_secondary = "#737373"
color_tertiary = "#595959"
color_quaternary = "#404040"
color_background = "#262626"

def load_data():
    try:
        with open("data.json", "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

def save_data(data):
    with open("data.json", "w") as file:
        json.dump(data, file, indent=4)

def add_entry():
    term = entry_term.get()
    definition = entry_definition.get("1.0", tk.END).strip()
    entry_class = entry_class_var.get()  # This retrieves the value from the class entry
    category = entry_category.get()
    data = load_data()

    # Update if term exists, else add a new entry
    if term in data:
        if messagebox.askyesno("Update Entry", "This term already exists. Update it?"):
            data[term] = {"definition": definition, "class": entry_class, "category": category}
        else:
            return  # Do nothing if user decides not to update
    else:
        data[term] = {"definition": definition, "class": entry_class, "category": category}
    
    save_data(data)
    refresh_entries()  # Refresh the listbox to show the new or updated entry
    messagebox.showinfo("Success", "Entry saved successfully!")
    
    # Optionally clear the fields after adding/updating
    entry_term.delete(0, tk.END)
    entry_definition.delete("1.0", tk.END)
    entry_class_var.delete(0, tk.END)
    entry_category.delete(0, tk.END)

def refresh_entries(search_query=""):
    entries_listbox.delete(0, tk.END)  # Clear the current list
    data = load_data()
    for term, info in sorted(data.items()):
        # Check if the term or the first word of the definition matches the search query
        first_word_of_definition = info["definition"].split()[0].rstrip(',') if info["definition"].split() else "NoDefinition"
        if search_query.lower() in term.lower() or search_query.lower() in first_word_of_definition.lower():
            entry_display = f"{term} - {first_word_of_definition}"
            entries_listbox.insert(tk.END, entry_display)
        elif not search_query:  # If no search query is provided, display all entries
            entry_display = f"{term} - {first_word_of_definition}"
            entries_listbox.insert(tk.END, entry_display)

def load_entry_for_editing():
    try:
        selected_entry = entries_listbox.get(entries_listbox.curselection())
        # Extract the term from the selected entry. Assume the term is everything before the " - " separator.
        selected_term = selected_entry.split(" - ")[0]
        data = load_data()
        entry = data[selected_term]
        # Clear existing values in the input fields
        entry_term.delete(0, tk.END)
        entry_definition.delete("1.0", tk.END)
        entry_class_var.delete(0, tk.END)
        entry_category.delete(0, tk.END)
        # Load the selected entry's values into the input fields
        entry_term.insert(0, selected_term)
        entry_definition.insert(tk.END, entry["definition"])
        entry_class_var.insert(0, entry["class"])
        entry_category.insert(0, entry["category"])
    except tk.TclError:
        messagebox.showerror("Selection Error", "Please select an entry to edit.")
    except KeyError:
        messagebox.showerror("Error", "Selected entry could not be found. It may have been deleted or modified.")


def delete_entry():
    try:
        selected_entry = entries_listbox.get(entries_listbox.curselection())
        # Extract just the term part before the " - " separator
        selected_term = selected_entry.split(" - ")[0]
        data = load_data()
        
        if messagebox.askyesno("Confirm Deletion", "Are you sure you want to delete this entry?"):
            # Use the extracted term to delete the entry from the data dictionary
            del data[selected_term]
            save_data(data)
            refresh_entries()  # You may need to adjust this call if your refresh_entries function requires the search query
    except tk.TclError:
        messagebox.showerror("Selection Error", "Please select an entry to delete.")
    except KeyError:
        messagebox.showerror("Error", "Selected entry could not be found. It may have been deleted or modified.")

app = tk.Tk()
app.title("JSON Data Manager")
app.geometry("600x600")  # Width x Height in pixels, adjust the values as needed
app.configure(bg=color_background)  # Step 2: Configure application window background

tk.Label(app, text="Term:", bg=color_background, fg=color_primary).pack()
entry_term = tk.Entry(app)
entry_term.pack()

tk.Label(app, text="Definition:", bg=color_background, fg=color_primary).pack()
entry_definition = tk.Text(app, height=4, width=50)  # Adjust the height and width as needed
entry_definition.pack()

tk.Label(app, text="Class:", bg=color_background, fg=color_primary).pack()
entry_class_var = tk.Entry(app)
entry_class_var.pack()

tk.Label(app, text="Category:", bg=color_background, fg=color_primary).pack()
entry_category = tk.Entry(app)
entry_category.pack()

tk.Button(app, text="Add/Update Entry", command=add_entry, bg=color_tertiary, fg=color_primary).pack(pady=(6, 6))

# Frame for the Search Widgets
search_frame = tk.Frame(app, bg=color_background)
search_frame.pack(fill=tk.X, pady=(5, 0))  # Keep the vertical padding for visual spacing

# Since we want to center the search widgets, it's helpful to use an intermediate frame
# that can be centered within search_frame.
search_widgets_frame = tk.Frame(search_frame)
search_widgets_frame.pack(pady=(0, 5), expand=True)

# Search Entry
tk.Label(search_widgets_frame, text="Search:").pack(side=tk.LEFT, padx=(0, 5))
search_var = tk.StringVar()
search_entry = tk.Entry(search_widgets_frame, textvariable=search_var, width=50)
search_entry.pack(side=tk.LEFT, padx=(5, 10))  # Adjusted padding for visual spacing

# Search Button
tk.Button(search_widgets_frame, text="Search", command=lambda: refresh_entries(search_var.get()), bg=color_tertiary, fg=color_primary).pack(side=tk.LEFT)

# Frame for the Listbox and Scrollbar
list_frame = tk.Frame(app)
list_frame.pack(fill=tk.BOTH, expand=True)

# Create the Scrollbar within the Frame
scrollbar = tk.Scrollbar(list_frame, orient="vertical")
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

# Create the Listbox within the Frame
entries_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, bg=color_background, fg=color_primary)
entries_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

# Configure the Scrollbar to scroll the Listbox content
scrollbar.config(command=entries_listbox.yview)

edit_button = tk.Button(app, text="Edit Selected Entry", command=load_entry_for_editing, bg=color_tertiary, fg=color_primary)
edit_button.pack(pady=(6,3))

delete_button = tk.Button(app, text="Delete Selected Entry", command=delete_entry, bg=color_tertiary, fg=color_primary)
delete_button.pack(pady=(3,6))

refresh_entries()  # Initial population of the listbox

app.mainloop()

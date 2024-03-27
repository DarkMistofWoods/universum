import tkinter as tk
from tkinter import messagebox
import json

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

def refresh_entries():
    entries_listbox.delete(0, tk.END)  # Clear the current list
    data = load_data()
    for term in sorted(data.keys()):  # Sort the terms alphabetically
        entries_listbox.insert(tk.END, term)

def load_entry_for_editing():
    try:
        selected_term = entries_listbox.get(entries_listbox.curselection())
        data = load_data()
        entry = data[selected_term]
        # Clear existing values
        entry_term.delete(0, tk.END)
        entry_definition.delete(0, tk.END)
        entry_class_var.delete(0, tk.END)
        entry_category.delete(0, tk.END)
        # Load selected entry's values into input fields
        entry_term.insert(0, selected_term)
        entry_definition.insert(0, entry["definition"])
        entry_class_var.insert(0, entry["class"])
        entry_category.insert(0, entry["category"])
    except tk.TclError:
        messagebox.showerror("Selection Error", "Please select an entry to edit.")

def delete_entry():
    try:
        selected_term = entries_listbox.get(entries_listbox.curselection())
        data = load_data()
        if messagebox.askyesno("Confirm Deletion", "Are you sure you want to delete this entry?"):
            del data[selected_term]
            save_data(data)
            refresh_entries()
    except tk.TclError:
        messagebox.showerror("Selection Error", "Please select an entry to delete.")

app = tk.Tk()
app.title("JSON Data Manager")
app.geometry("600x400")  # Width x Height in pixels, adjust the values as needed

tk.Label(app, text="Term:").pack()
entry_term = tk.Entry(app)
entry_term.pack()

tk.Label(app, text="Definition:").pack()
entry_definition = tk.Text(app, height=4, width=50)  # Adjust the height and width as needed
entry_definition.pack()

tk.Label(app, text="Class:").pack()
entry_class_var = tk.Entry(app)
entry_class_var.pack()

tk.Label(app, text="Category:").pack()
entry_category = tk.Entry(app)
entry_category.pack()

tk.Button(app, text="Add Entry", command=add_entry).pack()

entries_listbox = tk.Listbox(app)
entries_listbox.pack(fill=tk.BOTH, expand=True)

edit_button = tk.Button(app, text="Edit Selected Entry", command=load_entry_for_editing)
edit_button.pack()

delete_button = tk.Button(app, text="Delete Selected Entry", command=delete_entry)
delete_button.pack()

refresh_entries()  # Initial population of the listbox

app.mainloop()

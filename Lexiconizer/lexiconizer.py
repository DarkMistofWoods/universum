import tkinter as tk
from tkinter import messagebox, filedialog
import json
import csv
import os

# cmdline commands to package this script:
# pip install pyinstaller (optional; only if not already installed)
# pyinstaller --onefile --windowed path/thisscript.py

# Color scheme
color_primary = "#BFBFBF"
color_secondary = "#737373"
color_tertiary = "#595959"
color_quaternary = "#404040"
color_background = "#262626"

app = tk.Tk()
app.title("Lexiconizer")
app.geometry("600x650")  # Width x Height in pixels, adjust the values as needed
app.configure(bg=color_background)  # Step 2: Configure application window background

# string to hold the last used term
last_term_var = tk.StringVar(value="")  # Initialize with empty string

def add_entry():
    term = entry_term.get()
    definition = entry_definition.get("1.0", tk.END).strip()
    entry_class = entry_class_var.get()  # This retrieves the value from the class entry
    category = entry_category.get()
    data = load_data()

    if term: # Ensure a term was entered
        # Update if term exists, else add a new entry
        if term in data:
            if messagebox.askyesno("Update Entry", "This term already exists. Update it?"):
                data[term] = {"definition": definition, "class": entry_class, "category": category}
            else:
                return  # Do nothing if user decides not to update
        else:
            data[term] = {"definition": definition, "class": entry_class, "category": category}

        # Update the label with the last entered term
        last_term_var.set(f"Last Entered: {term}")  # Update text to show the last entered term
        
        save_data(data)
        refresh_entries()  # Refresh the listbox to show the new or updated entry
        messagebox.showinfo("Success", "Entry saved successfully!")
        
        # Optionally clear the fields after adding/updating
        entry_term.delete(0, tk.END)
        entry_definition.delete("1.0", tk.END)
        entry_class_var.delete(0, tk.END)
        entry_category.delete(0, tk.END)
    else:
        messagebox.showwarning("Warning", "Please enter a term.")

def refresh_entries(search_query=""):
    entries_listbox.delete(0, tk.END)  # Clear the current list
    data = load_data()
    for term, info in sorted(data.items()):
        # Split the definition into words
        definition_words = info["definition"].split()
        # Check if the definition is not empty
        if definition_words:
            # Remove a trailing comma from the first word of the definition, if present
            first_word_of_definition = definition_words[0].rstrip(',')
        else:
            first_word_of_definition = "NoDefinition"
        # Prepare the display string, now with the comma removed from the first word
        entry_display = f"{term} - {first_word_of_definition}"
        # Check if the term matches the search query and insert it into the listbox
        if not search_query or search_query.lower() in term.lower() or search_query.lower() in first_word_of_definition.lower():
            entries_listbox.insert(tk.END, entry_display)
    # Update the term count display to reflect the current state
    update_term_count()

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

def save_data_dialog():
    file_types = [('JSON Files', '*.json'), ('Text Files', '*.txt'), ('CSV Files', '*.csv')]
    file_path = filedialog.asksaveasfilename(filetypes=file_types, defaultextension=file_types)
    if file_path:
        # Determine the file extension and call the appropriate save function
        if file_path.endswith('.json'):
            save_data_as_json(load_data(), file_path)
        elif file_path.endswith('.txt'):
            save_data_as_txt(load_data(), file_path)
        elif file_path.endswith('.csv'):
            save_data_as_csv(load_data(), file_path)

def load_data_dialog():
    file_types = [('All Files', '*.*'), ('JSON Files', '*.json'), ('Text Files', '*.txt'), ('CSV Files', '*.csv')]
    file_path = filedialog.askopenfilename(filetypes=file_types)
    if file_path:
        if file_path.endswith('.json'):
            data = load_data_from_json(file_path)
        elif file_path.endswith('.txt'):
            data = load_data_from_txt(file_path)
        elif file_path.endswith('.csv'):
            data = load_data_from_csv(file_path)
        else:
            messagebox.showerror("Error", "Unsupported file type.")
            return
        update_ui_with_loaded_data(data)

def load_data_from_json(file_path):
    try:
        with open(file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        messagebox.showerror("Error", "File not found.")
    except json.JSONDecodeError:
        messagebox.showerror("Error", "Error decoding JSON from the file.")
    return {}

def load_data_from_txt(file_path):
    try:
        data = {}
        with open(file_path, "r") as file:
            for line in file:
                term, definition = line.strip().split(':', 1)
                data[term.strip()] = {"definition": definition.strip(), "class": "", "category": ""}
        return data
    except FileNotFoundError:
        messagebox.showerror("Error", "File not found.")
    except ValueError:
        messagebox.showerror("Error", "Error parsing TXT file. Ensure the format is correct.")
    return {}

def load_data_from_csv(file_path):
    try:
        with open(file_path, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            return {row['Term']: {"definition": row['Definition'], "class": row.get("Class", ""), "category": row.get("Category", "")} for row in reader}
    except FileNotFoundError:
        messagebox.showerror("Error", "File not found.")
    except KeyError:
        messagebox.showerror("Error", "CSV file missing required columns.")
    return {}

def load_data():
    """
    Attempts to load data from a default JSON file upon application start.
    This function can be expanded to check multiple files or to remember
    the last used file based on application requirements.
    """
    default_file_path = "data.json"  # Define a default file name
    try:
        # Attempt to load from the default JSON file
        with open(default_file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        # If the file does not exist, return an empty dictionary
        # or handle as appropriate (e.g., logging, user notification)
        return {}
    except json.JSONDecodeError as e:
        # Handle JSON decoding errors (file corrupted or invalid format)
        messagebox.showerror("Error", f"An error occurred while loading the data: {str(e)}")
        return {}

def save_data(data, file_path="data.json"):
    if not file_path.endswith('.json'):
        file_path += '.json'
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

def save_data_as_json(data, file_path):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def save_data_as_txt(data, file_path):
    with open(file_path, 'w') as file:
        for term, details in data.items():
            file.write(f"{term}: {details['definition']} - Class: {details['class']}, Category: {details['category']}\n")

def save_data_as_csv(data, file_path):
    import csv
    with open(file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Term', 'Definition', 'Class', 'Category'])
        for term, details in data.items():
            writer.writerow([term, details['definition'], details['class'], details['category']])

def update_ui_with_loaded_data(data):
    # Clear existing data in the UI, then repopulate
    entries_listbox.delete(0, tk.END)
    for term, info in data.items():
        entries_listbox.insert(tk.END, f"{term} - {info['definition'].split()[0]}")
    update_term_count()

def update_term_count():
    current_count = entries_listbox.size()
    term_count_var.set(f"Total Terms: {current_count}")

save_button = tk.Button(app, text="Save Lexicon Data", command=save_data_dialog, bg=color_tertiary, fg=color_primary)
save_button.pack(pady=(3, 6))

load_button = tk.Button(app, text="Load Lexicon Data", command=load_data_dialog, bg=color_tertiary, fg=color_primary)
load_button.pack(pady=(3, 6))

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

last_term_label = tk.Label(app, textvariable=last_term_var, bg=color_background, fg=color_primary)
last_term_label.pack(pady=(5, 0))  # Adjust padding as needed

# Frame for the Search Widgets
search_frame = tk.Frame(app, bg=color_background)
search_frame.pack(fill=tk.X, pady=(5, 0))  # Keep the vertical padding for visual spacing

# Since we want to center the search widgets, it's helpful to use an intermediate frame
# that can be centered within search_frame.
search_widgets_frame = tk.Frame(search_frame, bg=color_quaternary)
search_widgets_frame.pack(pady=(0, 5), expand=True)

# Search Entry
tk.Label(search_widgets_frame, text="Search by term/definition:", bg=color_quaternary, fg=color_primary).pack(side=tk.LEFT, padx=(0, 5))
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

# After defining your listbox and its scrollbar
term_count_var = tk.StringVar(value="Total Terms: 0")  # Initialize with 0 terms
term_count_label = tk.Label(app, textvariable=term_count_var, anchor='w', bg=color_background, fg=color_primary)
term_count_label.pack(fill=tk.X, padx=5, pady=(5, 0))  # Adjust padding and packing as needed

edit_button = tk.Button(app, text="Edit Selected Entry", command=load_entry_for_editing, bg=color_tertiary, fg=color_primary)
edit_button.pack(pady=(6,3))

delete_button = tk.Button(app, text="Delete Selected Entry", command=delete_entry, bg=color_tertiary, fg=color_primary)
delete_button.pack(pady=(3,6))

refresh_entries()  # Initial population of the listbox

app.mainloop()

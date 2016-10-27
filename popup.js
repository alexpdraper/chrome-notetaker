function addNote(title, content, id) {
  var note = document.createElement('article');
  note.className = 'note';

  if (title) {
    var noteTitle = document.createElement('h2');
    noteTitle.textContent = title;
    note.appendChild(noteTitle);
  }

  if (content) {
    var noteContent = document.createElement('section');
    noteContent.innerHTML = content;
    note.appendChild(noteContent);
  }

  var delBtn = document.createElement('a');
  delBtn.innerHTML = '&times;';
  delBtn.className = 'delete-button';
  delBtn.id = id;
  note.appendChild(delBtn);

  return note;
}

// When the DOM content has loaded
document.addEventListener('DOMContentLoaded', function() {
  var NOTES = document.getElementById('notes');
  var newNoteTitle = document.getElementById('new-note-title');
  var newNoteContent = document.getElementById('new-note-content');
  var nextID = 0;

  // Get the note list from storage
  chrome.storage.sync.get(null, function (notes) {
    // Array of note objects with id, title, content, and addedAt
    var noteList = [];
    console.log(notes);
    for (note in notes) {
      if (notes.hasOwnProperty(note)) {
        if (nextID <= notes[note].id) nextID = notes[note].id + 1;
        noteList.push(notes[note]);
      }
    }

    console.log(noteList);

    // Sort notes by most to least recent
    noteList.sort(function (a, b) {
      return b.addedAt - a.addedAt;
    });

    // Add each note to the list of notes
    noteList.forEach(function (note) {
      var newNote = addNote(note.title, note.content, note.id);
      NOTES.appendChild(newNote);
    });
  });

  document.getElementById('new-note-form').addEventListener('submit', function(event) {
    event.preventDefault();
    if (newNoteTitle.value || newNoteContent.value) {

      var setObj = {};

      setObj[nextID] = {
        id: nextID,
        title: newNoteTitle.value,
        content: newNoteContent.value,
        addedAt: Date.now()
      };

      chrome.storage.sync.set(setObj, function () {
        NOTES.insertBefore(addNote(
          newNoteTitle.value,
          newNoteContent.value,
          nextID
        ), NOTES.firstChild);

        nextID++;
        newNoteTitle.value = '';
        newNoteContent.value = '';
      });
    }
  });

  // Listen for click events in the notes list
  NOTES.addEventListener('click', function (event) {
    var target = event.target;

    // If the target is a delete button, remove the note from the notes list
    if (target.tagName === 'A' && target.className === 'delete-button') {
      this.removeChild(event.target.parentNode);
      chrome.storage.sync.remove(target.id);
    }
  });
});

import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Papa from 'papaparse';

function App() {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ callSign: '', name: '', location: '', notes: '' });
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('users')) || []);
  const [lists, setLists] = useState(JSON.parse(localStorage.getItem('lists')) || {});
  const [currentList, setCurrentList] = useState('');
  const [newList, setNewList] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('lists', JSON.stringify(lists));
  }, [users, lists]);

  const handleSearch = (event) => {
      setSearch(event.target.value);
      const foundUser = users.find((user) => user.callSign.toUpperCase().includes(event.target.value.toUpperCase()));
      if(foundUser){
          setForm(foundUser);
      }
  };

  const handleChange = (event) => {
      setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      if (!form.callSign) return;
      addUser(form, false);
  };

  const addUser = (user, overwrite) => {
    setUsers(addUserHelper(users, user, overwrite));
  }

  const addUserHelper = (users, user, overwrite) => {
    const existingUser = users.find((_user) => _user.callSign.toUpperCase() === user.callSign.toUpperCase());
    if (existingUser && !overwrite && !window.confirm('This user already exists. Do you want to overwrite this user?')) {
        return;
    }
    const newUser = { ...user };
    newUser.callSign = user.callSign.toUpperCase();
    const newUsers = users.filter((_user) => _user.callSign.toUpperCase() !== user.callSign.toUpperCase());
    newUsers.push(newUser);
    return newUsers;
  }

  const handleDelete = (event) => {
      event.preventDefault();
      if (!form.callSign) return;
      if(removeUser(form.callSign)) {
        setForm({ callSign: '', name: '', location: '', notes: '' });
      }
  };

  const removeUser = (callSign) => {
      const confirmation = window.confirm('Are you sure you want to delete this user?');
      if (confirmation) {
        const newUsers = users.filter((user) => user.callSign.toUpperCase() !== callSign.toUpperCase());
        setUsers(newUsers);
      }
      return confirmation;
  };

  const handleAddToList = (event) => {
      event.preventDefault();
      if (form.callSign && !lists[currentList].find((user) => user.callSign.toUpperCase() === form.callSign.toUpperCase())) {
          const newLists = { ...lists };
          newLists[currentList] = newLists[currentList] || [];
          newLists[currentList].push(form);
          setLists(newLists);
      }
  };

  const handleRemoveFromList = (callSign) => {
      const newLists = { ...lists };
      newLists[currentList] = newLists[currentList].filter((user) => user.callSign.toUpperCase() !== callSign.toUpperCase());
      setLists(newLists);
  };

  const handleNewList = (event) => {
      event.preventDefault();
      const newLists = { ...lists };
      newLists[newList] = [];
      setLists(newLists, () => setForm({ callSign: '', name: '', location: '', notes: '' }));
      setCurrentList(newList);
      setNewList('');
  };

  const handleNewListChange = (event) => {
      setNewList(event.target.value);
  };

  const handleListChange = (event) => {
      setCurrentList(event.target.value);
  };

  const handleDeleteList = () => {
      const newLists = { ...lists };
      delete newLists[currentList];
      setLists(newLists);
      setCurrentList('');
  };

  const handleModeChange = () => {
      setEditMode(!editMode);
      setSearch('');
      setForm({ callSign: '', name: '', location: '', notes: '' });
  };

  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
      setIsListening(true);
      const recognition = new window.webkitSpeechRecognition();
      recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log(transcript)
          const callSign = convertTranscriptToCallSign(transcript);
          setSearch(callSign);
          handleSearch({ target: { value: callSign } });
          setIsListening(false);
      };

      recognition.onend = () => {
          handleVoiceSearch();
      };

      recognition.start();
  };

  const exportUsersToCSV = () => {
      const csv = Papa.unparse(users); // Convert users array to CSV string
      const blob = new Blob([csv], { type: 'text/csv' }); // Create a Blob object with our CSV string
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); // Create an anchor element
      a.href = url;
      a.download = 'users.csv'; // Set the file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Cleanup the URL
  };

  const convertTranscriptToCallSign = (transcript) => {
      const phoneticAlphabet = {
          'alpha': 'A', 'bravo': 'B', 'charlie': 'C', 'delta': 'D',
          'echo': 'E', 'foxtrot': 'F', 'golf': 'G', 'hotel': 'H',
          'india': 'I', 'juliett': 'J', 'juliet': 'J', 'kilo': 'K', 'lima': 'L',
          'mike': 'M', 'november': 'N', 'oscar': 'O', 'papa': 'P',
          'quebec': 'Q', 'romeo': 'R', 'sierra': 'S', 'tango': 'T',
          'uniform': 'U', 'victor': 'V', 'whiskey': 'W', 'xray': 'X',
          'yankee': 'Y', 'zulu': 'Z', 'zero': '0', 'one': '1',
          'two': '2', 'three': '3', 'four': '4', 'five': '5',
          'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', '0': '0', '1': '1',
          '2': '2', '3': '3', '4': '4', '5': '5',
          '6': '6', '7': '7', '8': '8', '9': '9', 'slash': '/'
      };
      const validInputs = [
          'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'slash'
      ];
      let callSign = '';
      const words = transcript.toUpperCase().split(' ');
      words.forEach((word) => {
          if (phoneticAlphabet[word]) {
              callSign += phoneticAlphabet[word];
          }
      });
      // const words = transcript.toUpperCase().split('');
      // words.forEach((word) => {
      //     if (validInputs.includes(word)) {
      //         if (word === 'slash') {
      //             callSign += '/';
      //         } else {
      //             callSign += word.toUpperCase();
      //         }
      //     }
      // });
      return callSign;
  }

  const [csvInput, setCsvInput] = useState('');

  const handleCsvInputChange = (event) => {
      setCsvInput(event.target.value);
  }

  const handleBatchAdd = () => {
      const { data } = Papa.parse(csvInput, { header: true });
      let newUsers = users;
      data.forEach(user => {
        newUsers = addUserHelper(newUsers, user, true)
      });
      setUsers(newUsers);
      setCsvInput('');
  };

  return (
      <div>
          <div>
              <button onClick={handleModeChange}>{editMode ? 'Switch to Search Mode' : 'Switch to Edit Mode'}</button>
          </div>
          <div>
              <input value={search} onChange={handleSearch} placeholder="Search by Call Sign" />
              <button disabled={isListening} onClick={handleVoiceSearch}>{isListening ? 'Listening...' : 'Voice Search'}</button>
          </div>
          <div>
              <form onSubmit={handleSubmit}>
                  <input name="callSign" value={form.callSign} onChange={handleChange} placeholder="Call Sign" required disabled={!editMode}/>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Name" disabled={!editMode}/>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="Location" disabled={!editMode}/>
                  <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" disabled={!editMode}/>
                  {editMode && <button type="submit">Add / Update User</button>}
                  {editMode && <button type="button" onClick={handleDelete}>Delete User</button>}
                  <button type="button" onClick={handleAddToList} disabled={
                      (!currentList || 
                      !form.callSign || 
                      users.findIndex((user) => user.callSign.toUpperCase() === form.callSign.toUpperCase()) === -1 ||
                      lists[currentList].findIndex((user) => user.callSign.toUpperCase() === form.callSign.toUpperCase()) !== -1)
                  }>Add to List</button>
              </form>
          </div>
          <div>
              <select value={currentList} onChange={handleListChange}>
                  <option value="">Select a list</option>
                  {Object.keys(lists).map((list) => <option key={list} value={list}>{list}</option>)}
              </select>
              <input value={newList} onChange={handleNewListChange} placeholder="New List" />
              <button onClick={handleNewList}>Create List</button>
              <button onClick={handleDeleteList}>Delete Current List</button>
          </div>
          <div>
              {currentList && lists[currentList].map((user, index) => (
                  <div key={user.callSign}>
                      {index+1}. {user.callSign} - {user.name} - {user.location}
                      <button onClick={() => handleRemoveFromList(user.callSign)}>Remove</button>
                  </div>
              ))}
          </div>
          <div>
              <button onClick={() => setShowUsers(!showUsers)}>Show / Hide Users</button>
              {showUsers && users.map((user, index) => (
                  <div key={user.callSign}>
                      {index+1}. {user.callSign} - {user.name} - {user.location} - {user.notes}
                      <button onClick={() => removeUser(user.callSign)}>Remove</button>
                  </div>
              ))}
          </div>
          <textarea value={csvInput} onChange={handleCsvInputChange} />
          <button onClick={handleBatchAdd}>Add users from CSV</button>
          <button onClick={exportUsersToCSV}>Export Users to CSV</button>

      </div>
  );
}

export default App;

import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
      const foundUser = users.find((user) => user.callSign.toLowerCase().includes(event.target.value.toLowerCase()));
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
      const existingUser = users.find((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase());
      if (existingUser && !window.confirm('This user already exists. Do you want to overwrite this user?')) {
          return;
      }
      const newUser = { ...form };
      const newUsers = users.filter((user) => user.callSign.toLowerCase() !== form.callSign.toLowerCase());
      newUsers.push(newUser);
      setUsers(newUsers);
      setForm({ callSign: '', name: '', location: '', notes: '' });
  };

  const handleDelete = (event) => {
      event.preventDefault();
      if (!form.callSign) return;
      if (!window.confirm('Are you sure you want to delete this user?')) {
          return;
      }
      const newUsers = users.filter((user) => user.callSign.toLowerCase() !== form.callSign.toLowerCase());
      setUsers(newUsers);
      setForm({ callSign: '', name: '', location: '', notes: '' });
  };

  const handleAddToList = (event) => {
      event.preventDefault();
      if (form.callSign && !lists[currentList].find((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase())) {
          const newLists = { ...lists };
          newLists[currentList] = newLists[currentList] || [];
          newLists[currentList].push(form);
          setLists(newLists);
      }
  };

  const handleRemoveFromList = (callSign) => {
      const newLists = { ...lists };
      newLists[currentList] = newLists[currentList].filter((user) => user.callSign.toLowerCase() !== callSign.toLowerCase());
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
        console.log(event);
          setSearch(event.results[0][0].transcript);
          setIsListening(false);
      };
      recognition.start();
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
                      users.findIndex((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase()) === -1 ||
                      lists[currentList].findIndex((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase()) !== -1)
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
              {showUsers && users.map((user) => (
                  <div key={user.callSign}>
                      {user.callSign} - {user.name} - {user.location} - {user.notes}
                  </div>
              ))}
          </div>
      </div>
  );
}

export default App;

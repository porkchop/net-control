import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('users')) || []);
  const [form, setForm] = useState({ callSign: '', name: '', location: '', notes: '' });
  const [lists, setLists] = useState(() => JSON.parse(localStorage.getItem('lists')) || []);
  const [currentList, setCurrentList] = useState('');
  const [newList, setNewList] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
      localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
      localStorage.setItem('lists', JSON.stringify(lists));
  }, [lists]);

  const searchUser = (callSign) => {
      const user = users.find((user) => user.callSign.toLowerCase().startsWith(callSign.toLowerCase()));
      setForm(user || { callSign: '', name: '', location: '', notes: '' });
  };

  const handleChange = (event) => {
      if (editMode) {
          setForm({ ...form, [event.target.name]: event.target.value });
      } else {
          searchUser(event.target.value);
      }
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      const newUsers = [...users];
      const index = newUsers.findIndex((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase());
      if (index > -1) {
          if (window.confirm('Are you sure you want to update this user?')) {
              newUsers[index] = form;
          }
      } else {
          newUsers.push(form);
      }
      setUsers(newUsers);
      setForm({ callSign: '', name: '', location: '', notes: '' });
  };

  const handleDelete = (event) => {
      event.preventDefault();
      const newUsers = users.filter((user) => user.callSign.toLowerCase() !== form.callSign.toLowerCase());
      setUsers(newUsers);
      setForm({ callSign: '', name: '', location: '', notes: '' });
  };

  const handleListChange = (event) => {
      setCurrentList(event.target.value);
  };

  const handleAddToList = (event) => {
      event.preventDefault();
      const newLists = { ...lists };
      newLists[currentList] = newLists[currentList] || [];
      if (form.callSign && !newLists[currentList].find((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase())) {
          newLists[currentList].push(form);
          setLists(newLists);
      }
  };

  const handleNewListChange = (event) => {
      setNewList(event.target.value);
  };

  const handleNewList = (event) => {
      event.preventDefault();
      const newLists = { ...lists };
      newLists[newList] = [];
      setLists(newLists);
      setCurrentList(newList);
      setNewList('');
  };

  const handleDeleteList = (event) => {
      event.preventDefault();
      const newLists = { ...lists };
      delete newLists[currentList];
      setLists(newLists);
      setCurrentList('');
  };

  const toggleUsers = () => {
      setShowUsers(!showUsers);
  };

  const toggleMode = () => {
      setEditMode(!editMode);
      setForm({ callSign: '', name: '', location: '', notes: '' });
  };

  return (
      <div>
          <button onClick={toggleMode}>{editMode ? 'Switch to Search Mode' : 'Switch to Edit Mode'}</button>
          <form onSubmit={handleSubmit}>
              <input name="callSign" value={form.callSign} onChange={handleChange} placeholder="Call Sign" required />
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
              <input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
              <button type="submit">{editMode ? 'Add / Update User' : 'Search User'}</button>
              <button type="button" onClick={handleDelete}>Delete User</button>
              <button type="button" onClick={handleAddToList} disabled={!currentList || !form.callSign || users.findIndex((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase()) === -1}>Add to List</button>
          </form>
          <button onClick={toggleUsers}>{showUsers ? 'Hide' : 'Show'} Users</button>
          {showUsers && (
              <table>
                  <thead>
                      <tr>
                          <th>Call Sign</th>
                          <th>Name</th>
                          <th>Location</th>
                          <th>Notes</th>
                      </tr>
                  </thead>
                  <tbody>
                      {users.map((user, index) => (
                          <tr key={index}>
                              <td>{user.callSign}</td>
                              <td>{user.name}</td>
                              <td>{user.location}</td>
                              <td>{user.notes}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          )}
          <div>
              <select value={currentList} onChange={handleListChange}>
                  <option value="">Select a list...</option>
                  {Object.keys(lists).map((list) => (
                      <option key={list} value={list}>{list}</option>
                  ))}
              </select>
              <button type="button" onClick={handleDeleteList} disabled={!currentList}>Delete List</button>
              <form onSubmit={handleNewList}>
                  <input type="text" value={newList} onChange={handleNewListChange} placeholder="New list name" />
                  <button type="submit">Create List</button>
              </form>
              {lists[currentList] && (
                  <ol>
                      {lists[currentList].map((user, index) => (
                          <li key={index}>{user.callSign} - {user.name} - {user.location}</li>
                      ))}
                  </ol>
              )}
          </div>
      </div>
  );
}

export default App;

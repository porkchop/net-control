import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('users')) || []);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ callSign: '', name: '', location: '', notes: '' });
  const [lists, setLists] = useState(() => JSON.parse(localStorage.getItem('lists')) || []);
  const [currentList, setCurrentList] = useState('');
  const [newList, setNewList] = useState('');

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

  const handleSearch = (event) => {
      setSearch(event.target.value);
      searchUser(event.target.value);
  };

  const handleChange = (event) => {
      setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      const newUsers = [...users];
      const index = newUsers.findIndex((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase());
      if (index > -1) {
          newUsers[index] = form;
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
      if (!newLists[currentList].find((user) => user.callSign.toLowerCase() === form.callSign.toLowerCase())) {
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

  return (
      <div>
          <input type="text" value={search} onChange={handleSearch} placeholder="Search by call sign..." />
          <form onSubmit={handleSubmit}>
              <input name="callSign" value={form.callSign} onChange={handleChange} placeholder="Call Sign" required />
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
              <input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />
              <button type="submit">Add / Update User</button>
              <button type="button" onClick={handleDelete}>Delete User</button>
              <button type="button" onClick={handleAddToList} disabled={!currentList}>Add to List</button>
          </form>
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
                  <ul>
                      {lists[currentList].map((user, index) => (
                          <li key={index}>{user.callSign} - {user.name} - {user.location}</li>
                      ))}
                  </ul>
              )}
          </div>
      </div>
  );
}

export default App;

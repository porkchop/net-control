import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('users')) || []);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ callSign: '', name: '', location: '', notes: '' });

  useEffect(() => {
      localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

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
          </form>
      </div>
  );
}

export default App;

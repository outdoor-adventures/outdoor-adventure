import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import Nav from '../Nav/Nav';

const PendingAdventure = () => {
    // State for adventures, loading, and error
    const [adventures, setAdventures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [abilities, setAbilities] = useState([]);
    const [costLevels, setCostLevels] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Unified data loader
    const loadData = () => {
        setLoading(true);

        Promise.all([
            fetch('/api/adventures/admin/pending').then((res) => {
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                return res.json();
            }),
            fetch('/api/dropdown/category').then((res) => res.json()),
            fetch('/api/dropdown/ability').then((res) => res.json()),
            fetch('/api/dropdown/cost').then((res) => res.json()),
        ])
            .then(([advs, cats, abils, costs]) => {
                setAdventures(advs);
                setCategories(cats);
                setAbilities(abils);
                setCostLevels(costs);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert(`Failed to load data: ${err.message}`);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, []);


    // Handler for starting edit mode
    const handleEdit = (adventure) => {
        setEditingId(adventure.id);
        setEditData({
            activity_name: adventure.activity_name,
            address: adventure.address,
            link: adventure.link,
            description: adventure.description,
            cost_level_id: adventure.cost_level_id,
            category_id: adventure.category_id,
            ability_level_id: adventure.ability_level_id,
            latitude: adventure.latitude,
            longitude: adventure.longitude
        });
    };

    // Handler for saving edits
    const handleSaveEdit = (id) => {
        fetch(`/api/adventures/admin/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activity_name: editData.activity_name,
                address: editData.address,
                link: editData.link,
                description: editData.description,
                cost_level_id: editData.cost_level_id,
                category_id: editData.category_id,
                ability_level_id: editData.ability_level_id,
                latitude: editData.latitude || '',
                longitude: editData.longitude || ''
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Save failed: ${res.status}`);
                setEditingId(null);
                setEditData({});
                loadData();
            })
            .catch((err) => {
                console.error(err);
                alert(`Save failed: ${err.message}`);
            });
    };

    // Function for canceling edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    // Function for Accept
    const handleAccept = (id) => {
        fetch(`/api/adventures/status/${id}`, { method: 'PUT' })
            .then((res) => {
                if (!res.ok) throw new Error(`Accept failed: ${res.status}`);
                loadData();
            })
            .catch((err) => {
                console.error(err);
                alert(`Accept action failed: ${err.message}`);
            });
    };

    // Function for Delete
    const handleDelete = (id) => {
        fetch(`/api/adventures/${id}`, { method: 'DELETE' })
            .then((res) => {
                if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
                loadData();
            })
            .catch((err) => {
                console.error(err);
                alert(`Delete action failed: ${err.message}`);
            });
    };

    // When page is loading

    if (loading) {
        return (
            <section className="pending-page">
                <header className="pending-header">
                    <h1>Pending Adventures</h1>
                </header>
                <p>Loading pending adventures…</p>
            </section>
        );
    }

    // Error SEtup

    if (error) {
        return (
            <section className="pending-page">
                <header className="pending-header">
                    <h1>Pending Adventures</h1>
                </header>
                <p>Error loading adventures: {error}</p>
            </section>
        );
    }

    // When no adventures are available

    if (adventures.length === 0) {
        return (
            <section className="pending-page">
                <header className="pending-header">
                    <h1>Pending Adventures</h1>
                </header>
                <p>No pending adventures at the moment.</p>
            </section>
        );
    }

    
    return (
        
        <section className="pending-page">
            <Nav pageTitle="Pending Adventure" />
            <span></span>
            {/* <header className="pending-header">
                <h1>Pending Adventures</h1>
            </header> */}
            {/* <div className="pending-stripe" /> */}
            <ul className="pending-grid">
                {adventures.map((adv) => (
                    <li key={adv.id}>
                        <article className="pending-card">
                            <div className="card-title">
                                {editingId === adv.id ? (
                                    <input
                                        type="text"
                                        value={editData.activity_name || ''}
                                        onChange={(e) => setEditData({...editData, activity_name: e.target.value})}
                                    />
                                ) : (
                                    adv.activity_name
                                )}
                            </div>

                            <div className="card-top">
                                <div className="card-top-left">
                                <p>
                      <img src={`/uploads/${adv.photo}`}
                      alt={adv.photo}
                      className='adventure-image' />

                    </p>
                                </div>
                                <div className="card-top-right">
                                    <div className="card-top-right-box">
                                        <div className="field">
                                            <label htmlFor={`price-${adv.id}`}>
                                                Price
                                            </label>
                                            <select
                                                id={`price-${adv.id}`}
                                                value={editingId === adv.id ? (editData.cost_level_id || '') : (adv.cost_level_id || '')}
                                                onChange={(e) => editingId === adv.id && setEditData({...editData, cost_level_id: e.target.value})}
                                                disabled={editingId !== adv.id}
                                            >
                                                {costLevels.map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.cost_level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label
                                                htmlFor={`category-${adv.id}`}
                                            >
                                                Category
                                            </label>
                                            <select
                                                id={`category-${adv.id}`}
                                                value={editingId === adv.id ? (editData.category_id || '') : (adv.category_id || '')}
                                                onChange={(e) => editingId === adv.id && setEditData({...editData, category_id: e.target.value})}
                                                disabled={editingId !== adv.id}
                                            >
                                                {categories.map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label
                                                htmlFor={`difficulty-${adv.id}`}
                                            >
                                                Difficulty
                                            </label>
                                            <select
                                                id={`difficulty-${adv.id}`}
                                                value={editingId === adv.id ? (editData.ability_level_id || '') : (adv.ability_level_id || '')}
                                                onChange={(e) => editingId === adv.id && setEditData({...editData, ability_level_id: e.target.value})}
                                                disabled={editingId !== adv.id}
                                            >
                                                {abilities.map((a) => (
                                                    <option
                                                        key={a.id}
                                                        value={a.id}
                                                    >
                                                        {a.ability_level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <label>Location</label>
                                <input
                                    type="text"
                                    readOnly={editingId !== adv.id}
                                    value={editingId === adv.id ? editData.address || '' : adv.address}
                                    onChange={(e) => editingId === adv.id && setEditData({...editData, address: e.target.value})}
                                />
                            </div>
                            <div className="field">
                                <label>Link (Optional)</label>
                                <input
                                    type="text"
                                    readOnly={editingId !== adv.id}
                                    value={editingId === adv.id ? editData.link || '' : adv.link}
                                    onChange={(e) => editingId === adv.id && setEditData({...editData, link: e.target.value})}
                                />
                            </div>
                            <div className="field description">
                                <label>Description</label>
                                <textarea
                                    readOnly={editingId !== adv.id}
                                    rows="3"
                                    value={editingId === adv.id ? editData.description || '' : adv.description}
                                    onChange={(e) => editingId === adv.id && setEditData({...editData, description: e.target.value})}
                                />
                            </div>

                            <div className="card-buttons">
                                {editingId === adv.id ? (
                                    <>
                                        {/* <button
                                            className="btn accept"
                                            onClick={() => handleSaveEdit(adv.id)}
                                        >
                                            Save
                                        </button> */}
                                        <button
                                            className="btn delete"
                                            onClick={handleCancelEdit}
                                        >
                                            Next
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn delete"
                                            onClick={() => handleEdit(adv)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn accept"
                                            onClick={() => handleAccept(adv.id)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn delete"
                                            onClick={() => handleDelete(adv.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default PendingAdventure;

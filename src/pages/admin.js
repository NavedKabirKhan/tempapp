import { useState, useEffect } from 'react';
import adminStyle from "@/styles/admin.module.css"
export default function Admin() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);  // Modal state

  // Fetch all cards to display on the admin page
  const fetchCards = async () => {
    const res = await fetch('/api/admin');
    const data = await res.json();
    if (data.success) {
      setCards(data.cards);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Handle submit for creating or editing cards
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    const method = editId ? 'PUT' : 'POST';
    if (editId) formData.append('id', editId);

    const res = await fetch('/api/admin', {
      method,
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      alert(editId ? 'Card updated successfully' : 'Card created successfully');
      setImage(null);
      setText('');
      setEditId(null);
      setIsModalOpen(false);  // Close modal after saving
      fetchCards();  // Refresh the list of cards
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  // Open the modal and pre-fill the form with the selected card's data
  const handleEdit = (card) => {
    setEditId(card.id);
    setText(card.text);
    setImage(null);  // No need to set an image initially; can upload a new one if desired
    setIsModalOpen(true);  // Open the modal
  };

  // Handle delete by removing the selected card
  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin?id=${id}`, {
      method: 'DELETE',
    });

    const result = await res.json();
    if (result.success) {
      alert('Card deleted successfully');
      fetchCards();  // Refresh the list of cards
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  // Close modal without saving changes
  const handleCancel = () => {
    setIsModalOpen(false);
    setImage(null);
    setText('');
    setEditId(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add text"
        />
        <button type="submit">{editId ? 'Edit' : 'Add'} Card</button>
      </form>

      <h2>All Cards</h2>
      <div>
        {cards.length === 0 ? (
          <p>No cards available.</p>
        ) : (
          cards.map((card) => (
            <div key={card.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
              <img src={card.image} alt="Card Image" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              <p>{card.text}</p>
              <small>{new Date(card.createdAt).toLocaleDateString()}</small>
              <div>
                <button onClick={() => handleEdit(card)}>Edit</button>
                <button onClick={() => handleDelete(card.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for editing card */}
      {isModalOpen && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>Edit Card</h2>
            <form onSubmit={handleSubmit}>
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Edit text"
              />
              <div style={modalButtonContainer}>
                <button type="submit" className={adminStyle.save}>Save</button>
                <button type="button" onClick={handleCancel} className={adminStyle.cancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline CSS styles for the modal
const modalStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: '1000',
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
  textAlign: 'center',
};

const modalButtonContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
};

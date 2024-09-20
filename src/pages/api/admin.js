import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,  // Disable Next.js body parsing
  },
};

const getCardsFilePath = () => path.join(process.cwd(), 'src', 'data', 'cards.json');

// Function to read cards.json
const readCards = async () => {
  const filePath = getCardsFilePath();
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Function to write to cards.json
const writeCards = async (cards) => {
  const filePath = getCardsFilePath();
  await fs.writeFile(filePath, JSON.stringify(cards, null, 2));
};

const handler = async (req, res) => {
  const method = req.method;

  if (method === 'GET') {
    // Fetch all cards
    try {
      const cards = await readCards();
      return res.status(200).json({ success: true, cards });
    } catch (error) {
      console.error('Error fetching cards:', error);
      return res.status(500).json({ success: false, message: 'Error fetching cards' });
    }
  }

  if (method === 'POST') {
    // Handle card creation
    const form = formidable({
      multiples: false,
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ success: false, message: 'Error parsing form data' });
      }

      const text = fields.text[0];
      const image = files.image[0];
      const imageName = `${uuidv4()}-${image.originalFilename || 'image'}`;

      try {
        const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName);
        await fs.rename(image.filepath, imagePath);

        const newCard = {
          id: uuidv4(),
          text,
          image: `/uploads/${imageName}`,
          createdAt: new Date().toISOString(),
        };

        const cards = await readCards();
        cards.push(newCard);
        await writeCards(cards);

        return res.status(200).json({ success: true, data: newCard });
      } catch (error) {
        console.error('Error creating card:', error);
        return res.status(500).json({ success: false, message: 'Error creating card' });
      }
    });
  } else if (method === 'PUT') {
    // Handle card editing
    const form = formidable({
      multiples: false,
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ success: false, message: 'Error parsing form data' });
      }

      const id = fields.id[0];
      const text = fields.text[0];
      const image = files.image ? files.image[0] : null;

      try {
        const cards = await readCards();
        const cardIndex = cards.findIndex((card) => card.id === id);

        if (cardIndex === -1) {
          return res.status(404).json({ success: false, message: 'Card not found' });
        }

        cards[cardIndex].text = text;

        if (image) {
          const imageName = `${uuidv4()}-${image.originalFilename || 'image'}`;
          const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName);
          await fs.rename(image.filepath, imagePath);

          // Delete the old image
          const oldImagePath = path.join(process.cwd(), 'public', cards[cardIndex].image);
          await fs.unlink(oldImagePath);

          cards[cardIndex].image = `/uploads/${imageName}`;
        }

        await writeCards(cards);
        return res.status(200).json({ success: true, data: cards[cardIndex] });
      } catch (error) {
        console.error('Error updating card:', error);
        return res.status(500).json({ success: false, message: 'Error updating card' });
      }
    });
  } else if (method === 'DELETE') {
    // Handle card deletion
    const { id } = req.query;

    try {
      const cards = await readCards();
      const cardIndex = cards.findIndex((card) => card.id === id);

      if (cardIndex === -1) {
        return res.status(404).json({ success: false, message: 'Card not found' });
      }

      // Remove the image from uploads
      const imagePath = path.join(process.cwd(), 'public', cards[cardIndex].image);
      await fs.unlink(imagePath);

      // Remove the card from the list
      cards.splice(cardIndex, 1);

      await writeCards(cards);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting card:', error);
      return res.status(500).json({ success: false, message: 'Error deleting card' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }
};

export default handler;

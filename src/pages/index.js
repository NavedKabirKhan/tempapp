import fs from 'fs';
import path from 'path';
import styles from '../styles/Home.module.css';  // Import the CSS file

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'src', 'data', 'cards.json');
  const data = await fs.promises.readFile(filePath, 'utf-8');
  const cards = JSON.parse(data);

  return {
    props: {
      cards,
    },
  };
}

export default function Home({ cards }) {
  return (
    <div className={styles.container}>
      {cards.length === 0 ? (
        <p>No cards available.</p>
      ) : (
        <div className={styles.grid}>
          {cards.map((card) => (
            <div key={card.id} className={styles.card}>
              <img src={card.image} alt="Card Image" className={styles.image} />
              <div className={styles.content}>
                <h3 className={styles.h3text}>{card.text}</h3>
                <small className={styles.small}>{new Date(card.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

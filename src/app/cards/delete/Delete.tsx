'use client';

import styles from './delete.module.css'

type CardProps = {
  cardname: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const Delete = ({ cardname, onConfirm, onCancel }: CardProps) => {
  return (
    <div className={styles.mainContainer}>
      {/* Modal Box */}
      <div className={styles.delContainer}>
        <div className={styles.heading}>
          Delete Card: {cardname}
        </div>

        <div className={styles.paraContainer}>
          <p>Are you sure you want to delete this card?</p>
          <p className={styles.textRed}>This action cannot be undone.</p>
        </div>

        {/* Buttons */}
        <div className={styles.btnContainer}>
          <button
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={styles.delBtn}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Delete;

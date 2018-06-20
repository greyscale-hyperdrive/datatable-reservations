import React from 'react';
import styles from './partySize.css';


const partySize = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const PartySize =(props) => {
  return (
    <div> 
      <div className={`${styles.partyTitle}`} >Party Size</div>
        <i className={`fa fa-angle-down ${styles.arrowptsize}`}></i>
        <span className={`${styles.for}`}>For</span>
        <div className={`${styles.partyD}`}>
          <select onChange={props.partyChange} className={`${styles.partySelect} ${styles.PartySize}`}>
            {partySize.map((size, id) => (
              <option value={size} key={id} >&#160;&#160;&#160;&#160;&#160;{size}</option>
              )
            )}
          </select>   
        </div>
    </div> 
  )
}

export default PartySize;

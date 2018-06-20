import React from 'react';
import styles from './time.css';

const time = [
  '12:00 AM', '12:30 AM', '1:00 AM', '2:00 AM', '2:30 AM',
  '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', 
  '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM',
  '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '1:00 PM',
  '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM','5:00 PM', '5:30 PM', '6:00 PM', 
  '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', 
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', 
  '11:30 PM',
];
const Time = (props) => { 
  return (
    <div className={styles.time}>
      <span className={`${styles.timeArrow} glyphicon glyphicon-chevron-down`}></span>
      <i class={`fa fa-angle-down ${styles.timeArrow}`}></i>
      <select className={styles.timeSelect} onChange={props.timeChange} value={props.time} >
        {time.map((time, id) => {
          if (time === '5:00 PM') {
            return <option value={time} key={id}>{time}</option>;
          }
            return <option key={id}>{time}</option>;
          }
        )} 
      </select>
    </div>
  );
}

export default Time;

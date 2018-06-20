import React from 'react';
import style from './date.css';


const Date = (props) => (
  <input value={props.date} onChange={props.dateChange} type="date" className={style.calendar} required="required"></input>
) 

export default Date;

 
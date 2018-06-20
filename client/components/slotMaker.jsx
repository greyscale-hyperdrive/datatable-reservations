import React from 'react';
import styles from './slotMaker.css';

const time = [
  '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM',
  '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM',
  '3:30 PM', '4:00 PM', '4:30 PM','5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM',
  '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM',
  '11:00 PM'
]; 
class SlotMaker extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const timeAvail = [];
    let timeObjArray = this.props.timeSlots;
    let idxOfPick = time.findIndex(pick => pick === this.props.time);
    let timeSelected = idxOfPick - 1;
    if (this.props.timeSlots.length !== 0 && this.props.timeSlots[0].party_size_max <= this.props.partySize) { 
      return (
        <div className={`${styles.jumbotronClean} jumbotron`}>   
          <div className={`${styles.warning} row`} >
            <svg className={`${styles.circle} col-lg-1 col-md-1 col-sm-1 col-xs-1`} width="20" height="50">
              <circle cx="19" cy="17" r="10" fill="rgb(51, 51, 51)" />
              <text className="glyphText" x="19" y="22" stroke="white" textAnchor="middle" >!</text>
            </svg>   
            <div className={`${styles.warn} col-lg-11 col-md-11 col-sm-11 col-xs-11`} >Your party is too large to make an online reservation at ______. To book this restaurant, contact them directly.</div>
          </div> 
        </div>   
      )
    }
    if (this.props.isClicked) {
      let notAvail = timeObjArray.map((dataObj) => {
        return dataObj.time;
      });
      if (!notAvail.includes(time[idxOfPick]) && time[idxOfPick] !== undefined) {
        timeAvail.push(time[idxOfPick]);
      }
      for (var i = idxOfPick; i < idxOfPick + 5; i++) {
        if (!notAvail.includes(time[i+1]) && time[i+1] !== undefined) {
          timeAvail.push(time[i+1]);
        }
        if (!notAvail.includes(time[timeSelected]) && time[timeSelected] !== undefined) {
          timeAvail.unshift(time[timeSelected]);
        }
        timeSelected--;
      }
    }
    if (timeAvail.length > 0) {
      return (
        <div>
          {timeAvail.map((entry, id)=> (
            <button id={styles.timeButtid} className={`${styles.timeButt} btn btn-danger`} value={entry} key={id}>{entry}</button>
            )
          )}
          <div className={styles.bookedToday}>Booked 5 times today</div>
          <div className={styles.bookedTodayNum}>{`You're in luck! We still have ${timeAvail.length} timeslots left`}</div>
        </div>
      )
    } else {
      return (
        <div>
          {timeAvail.map((entry, id)=> (
            <button id={styles.timeButtid} className={`${styles.timeButt} btn btn-danger`} value={entry} key={id}>{entry}</button>
            )
          )}
          <div className={styles.bookedToday}>Booked 5 times today</div>
        </div>
      )
    }
  }
}

export default SlotMaker;


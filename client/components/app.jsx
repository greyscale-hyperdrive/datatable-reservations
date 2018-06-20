import React from 'react';
import axios from 'axios';
import PartySize from './partySize.jsx';
import Date from './date.jsx';
import Time from './time.jsx';
import SlotMaker from './slotMaker.jsx';
import styles from '../app.css';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restaurantId: this.props.match.params.restaurant_id,
      currPartySize: 2,
      isClicked: false,
      currTime: "6:00 PM", 
      currDate: "2018-06-01",
      currTimeSlots: [{party_max_size: 1}],
      timeSlots: [{party_max_size: 1}],
      partySize: 2,
      time: "6:00 PM", 
      date: "2018-06-01", 
    }
  }   
  componentDidMount() {
    axios.get(`/reservations/restaurant/${this.state.restaurantId}/${this.state.currDate}`)
      .then((response) => {
        this.setState({
          currTimeSlots: response.data,
        });
      })
      .catch((error) => {
        throw(error);
      }); 
  }
  findTable() {
    axios.get(`/reservations/restaurant/${this.state.restaurantId}/${this.state.currDate}`)
      .then((response) => {
        this.setState({
          timeSlots: response.data,
          isClicked: true,
          partySize: this.state.currPartySize,
          time: this.state.currTime, 
          date: this.state.currDate,
          partySizeMax: this.state.currPartySizeMax,
        }); 
      });
  }
  partySizeChange (event) {
    this.setState({
      currPartySize: event.target.value,
    });
  }
  timeChange (event) {
    this.setState({
      currTime: event.target.value,
    })
  }
  dateChange (event) {
    this.setState({
      currDate: event.target.value,
    });
  }
  render () {
    return (
        <div className={`sticky-top col-lg-12 col-md-12 col-sm-12 col-xs-12 container  ${styles.reserveContainer} `}>
          <h4 className={styles.title} >Make a reservation</h4>
          <PartySize partyChange={this.partySizeChange.bind(this)} />
          <div className={`${styles.container} ${styles.dateTimeContain} container col-lg-12 col-md-12 col-sm-12 col-xs-12`} > 
            <div className="row">
              <div className={`${styles.dateTitle} col-lg-6 col-md-6 col-sm-6 col-xs-6`}>Date</div>
              <div className={`${styles.timeTitle} col-lg-6 col-md-6 col-sm-6 col-xs-6`}>Time</div>     
            </div>
            <div className="row"> 
              <div className={`${styles.dateCol} col-lg-6 col-md-6 col-sm-6 col-xs-6 date`}>
                <Date date={this.state.currDate} dateChange={this.dateChange.bind(this)} />
              </div>
              <div className={`col-lg-6 col-md-6 col-sm-6 col-xs-6 ${styles.timeCol}`}>
                <Time time={this.state.currTime} timeChange={this.timeChange.bind(this)} />
              </div>
            </div>
          </div> 
          <div className={styles.buttStyle}>
            <button id={styles.findButtonid} className={`btn btn-danger ${styles.findButt}`} onClick={this.findTable.bind(this)} >Find a Table</button>
          </div>
          <div className={`${styles.container} ${styles.slots} col-lg-12 col-md-12 col-sm-12 col-xs-12`}>
              <SlotMaker 
                isClicked={this.state.isClicked}
                timeSlots={this.state.timeSlots} 
                partySize={this.state.partySize} 
                time={this.state.time}
              />
          </div>
          <button className={styles.saveButt}>Save this Restaurant</button>
        </div>
    ) 
  }
}

export default App;


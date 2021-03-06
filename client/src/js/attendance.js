import React, { Component } from 'react';
import Header from './components/header';
import GuestList from './components/guestlist';

const MEETUP_LOCAL_STORAGE = 'meetup-latest-event';

const loadObjectFromLocalStorage = (objectKey) => {
  const latestEvent = JSON.parse(localStorage.getItem(MEETUP_LOCAL_STORAGE));
  return latestEvent ? latestEvent[objectKey] : null;
}

class Attendance extends Component {
  state = {
    currentEvent: {
      id: loadObjectFromLocalStorage('id'),
      name: loadObjectFromLocalStorage('name'),
      group: loadObjectFromLocalStorage('group'),
    },
    attendees: loadObjectFromLocalStorage('attendees') || [],
    searchString: '',
  };

  updateAttendeesList = () => {
    if(window.confirm('This will reload the current list of attendees. Are you sure you want to continue?')) {
      fetch('/api/getNextEvent')
        .then(res => res.json())
        .then(json => {
          if (json.error) {
            return Promise.reject(json.error);
          }
          this.setState({ currentEvent: json });
          return fetch(`/api/getEventAttendees/${json.id}`);
        })
        .then(res => res.json())
        .then(json => {
          this.saveAttendees(json);
          this.setState({ searchString: '' });
        })
        .catch(error => console.error(error));
    }
  }

  downloadAttendeesList = () => {
    const arrivedAttendees = this.state.attendees
      .filter(attendee => attendee.arrived)
      .map(attendee => attendee.name);
    const csvContent = `data:text/csv;charset=utf-8,${arrivedAttendees.join(',')}`;
    window.open(encodeURI(csvContent));
  }

  emailAttendeesList = () => {
    const emailRecipient = window.prompt('Which email should we send the guestlist to?');
    if (emailRecipient) {
      const arrivedAttendees = this.state.attendees
        .filter(attendee => attendee.arrived)
        .map(attendee => attendee.name);
      fetch('/api/sendEmailEventAttendees', {
        body: JSON.stringify({
          currentEvent: this.state.currentEvent.name,
          arrivedAttendees,
          emailRecipient,
        }),
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'user-agent': 'Mozilla/4.0 MDN Example',
          'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
      });
    }
  }

  addNewAttendee = () => {
    const newAttendee = window.prompt('Please enter your name');
    if (newAttendee) {
      const attendees = this.state.attendees.concat([{
        id: `${newAttendee}-${Date.now()}`,
        name: newAttendee,
        avatar: null,
        arrived: true,
      }]);
      this.saveAttendees(attendees);
    }
  }

  saveAttendees = (attendees) => {
    this.setState({ attendees });
    localStorage.setItem(MEETUP_LOCAL_STORAGE, JSON.stringify({
      id: this.state.currentEvent.id,
      name: this.state.currentEvent.name,
      attendees,
    }));
  }

  onSearch = (event) => {
    const searchString = event.target.value.toLowerCase();
    this.setState({ searchString });
  }

  toggleAttendeeArrival = (attendeeId, arrived) => {
    const attendees = this.state.attendees;
    const attendeeIndex = attendees.findIndex(attendee => attendee.id === attendeeId);

    if (attendees[attendeeIndex].arrived !== arrived) {
      attendees[attendeeIndex].arrived = arrived;
      this.saveAttendees(attendees);
    }

    this.setState({ searchString: '' });
  }

  addContactGuest = (attendeeId, contactInfo) => {
    const attendees = this.state.attendees;
    const attendeeIndex = attendees.findIndex(attendee => attendee.id === attendeeId);

    attendees[attendeeIndex].contact = contactInfo;
    this.saveAttendees(attendees);
  }

  render() {
    return (
      <div className="attendance">
        <Header
          currentEventName={this.state.currentEvent.name}
          attendees={this.state.attendees}
          onSearch={this.onSearch}
          searchString={this.state.searchString}
          addNewAttendee={this.addNewAttendee}
          updateAttendeesList={this.updateAttendeesList}
          downloadAttendeesList={this.downloadAttendeesList}
          emailAttendeesList={this.emailAttendeesList}
        />
        <GuestList
          attendees={this.state.attendees}
          searchString={this.state.searchString}
          toggleAttendeeArrival={this.toggleAttendeeArrival}
          addContactGuest={this.addContactGuest}
        />
      </div>
    );
  }
}

export default Attendance;

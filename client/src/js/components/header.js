import React from 'react';
import PropTypes from 'prop-types';
import Menu from './menu';
import ProgressBar from './progress-bar';

const Header = (props) => {
  const getAttendance = (asPercentage) => {
    const totalAttendees = props.attendees.length;
    const arrivedAttendees = props.attendees.filter(attendee => attendee.arrived).length;
    return asPercentage ? ((arrivedAttendees / totalAttendees) * 100) : `${arrivedAttendees} / ${totalAttendees}`;
  }

  return (
    <div className="attendance-header">
      <h1 className="attendance-header__title">{props.currentEventName}</h1>
      <div className="attendance-header__searchbar">
        <div className="attendance-header__capacity">
          {`Guests: ${getAttendance()}`}
        </div>
        <input
          className="attendance-header__search"
          type="text"
          onChange={props.onSearch}
          value={props.searchString}
          placeholder="Search for a guest"
        />
        <button
          className="attendance-header__add_guest_button"
          onClick={props.addNewAttendee}
        >
          <span className="attendance-header__button-label">Click here if you're not on the guestlist!</span>
        </button>
      </div>
      <ProgressBar percentage={getAttendance(true)} />
      <Menu>
        <button onClick={props.updateAttendeesList}>Refresh guest list</button>
        <button onClick={props.downloadAttendeesList}>Download attendees</button>
        <button onClick={props.emailAttendeesList}>Email attendees</button>
      </Menu>
    </div>
  );
}

Header.propTypes = {
  attendees: PropTypes.array,
  currentEventName: PropTypes.string,
  updateAttendeesList: PropTypes.func,
  downloadAttendeesList: PropTypes.func,
  emailAttendeesList: PropTypes.func,
  onSearch: PropTypes.func,
  addNewAttendee: PropTypes.func,
  searchString: PropTypes.string,
};

Header.defaultProps = {
  attendees: [],
  currentEventName: '',
  updateAttendeesList: () => {},
  downloadAttendeesList: () => {},
  emailAttendeesList: () => {},
  onSearch: () => {},
  addNewAttendee: () => {},
  searchString: '',
}

export default Header;

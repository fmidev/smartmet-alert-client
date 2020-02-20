import DayModel from 'models/days/DayModel';

const ThursdayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('thursday'));
  },
});

export default ThursdayModel;

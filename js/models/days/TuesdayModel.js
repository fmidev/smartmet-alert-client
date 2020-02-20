import DayModel from 'models/days/DayModel';

const TuesdayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('tuesday'));
  },
});

export default TuesdayModel;

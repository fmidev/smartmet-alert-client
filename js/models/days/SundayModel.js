import DayModel from 'models/days/DayModel';

const SundayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('sunday'));
  },
});

export default SundayModel;

import DayModel from 'models/days/DayModel';

const SaturdayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('saturday'));
  },
});

export default SaturdayModel;

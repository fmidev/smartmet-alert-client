import DayModel from 'models/days/DayModel';

const MondayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('monday'));
  },
});

export default MondayModel;

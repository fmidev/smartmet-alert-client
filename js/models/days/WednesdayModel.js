import DayModel from 'models/days/DayModel';

const WednesdayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('wednesday'));
  },
});

export default WednesdayModel;

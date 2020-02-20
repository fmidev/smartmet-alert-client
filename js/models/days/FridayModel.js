import DayModel from 'models/days/DayModel';

const FridayModel = DayModel.extend({
  initialize() {
    DayModel.prototype.initialize.call(this);
    this.set('weekdayName', __('friday'));
  },
});

export default FridayModel;

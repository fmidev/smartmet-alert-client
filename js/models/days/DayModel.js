const DayModel = Backbone.Model.extend({
  defaults: {
    index: 0,
    dateTime: moment(null),
    start: moment(null),
    end: moment(null),
    weekdayName: '',
    date: '',
    month: '',
    modificationTime: moment(null),
    regionWarnings: [{}, {}, {}, {}, {}],
  },
  validation: {
    index: {
      required: true,
    },
  },
  initialize() {
    this.set(
      'start',
      this.get('dateTime')
        .clone()
        .startOf('day')
        .add(15, 'm')
    );
    this.set(
      'end',
      this.get('dateTime')
        .clone()
        .endOf('day')
        .subtract(15, 'm')
    );
    this.set(
      'month',
      this.get('dateTime')
        .clone()
        .month() + 1
    );
    this.set(
      'date',
      this.get('dateTime')
        .clone()
        .date()
    );
    this.get('regionWarnings')[this.get('index')] = {};
  },
  contains(start, end) {
    return (
      this.get('start').isSameOrBefore(end) &&
      this.get('end').isSameOrAfter(start)
    );
  },
});

export default DayModel;

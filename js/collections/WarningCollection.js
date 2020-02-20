import WarningModel from 'models/warnings/WarningModel';

const WarningCollection = Backbone.Collection.extend({
  model: WarningModel,
  comparator(model1, model2) {
    const severity = [model1.get('severity'), model2.get('severity')];
    const priority = [model1.get('priority'), model2.get('priority')];
    const magnitude = [model1.get('magnitude'), model2.get('magnitude')];
    if (severity[0] !== severity[1]) {
      return severity[1] - severity[0];
    } else if (priority[0] !== priority[1]) {
      return priority[0] - priority[1];
    } else if (magnitude[0] !== magnitude[1]) {
      return magnitude[0] - magnitude[1];
    } else if (
      !model1.get('modificationTime').isSame(model2.get('modificationTime'))
    ) {
      return model1
        .get('modificationTime')
        .isAfter(model2.get('modificationTime'))
        ? 1
        : -1;
    } else {
      return model1.get('effectiveUntil').isAfter(model2.get('effectiveUntil'))
        ? 1
        : -1;
    }
  },
  getFiltered(warnings) {
    if (typeof warnings === 'undefined') {
      warnings = this.toArray();
    }
    return warnings.filter((warning, index, warnings) => {
      if (index === 0) {
        return true;
      }
      const context = warning.get('context');
      for (let i = 0; i < index; i++) {
        if (context === warnings[i].get('context')) {
          return false;
        }
      }
      return true;
    });
  },
  getModelsWhere(key, value) {
    return this.models.reduce((array, item) => {
      if (item.get(key).includes(value)) {
        array.push(item);
      }
      return array;
    }, []);
  },
  getMaxSeverity(key, value) {
    return Math.max(
      ...this.models.reduce((array, item) => {
        if (item.get(key).includes(value)) {
          array.push(item.get('severity'));
        }
        return array;
      }, []),
      1
    );
  },
  isIdentical(model1, model2) {
    return (
      model1.get('context') === model2.get('context') &&
      model1.get('severity') === model2.get('severity') &&
      model1.get('magnitude') === model2.get('magnitude') &&
      model1.getDirection() === model2.getDirection() &&
      model1.getText() === model2.getText()
    );
  },
});

export default WarningCollection;

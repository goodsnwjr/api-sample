import { get } from '../../lib/protocols';
import moment from 'moment';

// action types
export const GET_LIST = 'CALENDAR/LIST';

// actions
export const getList = () => {
  const startOfMonth = moment.utc(moment().startOf('month').toDate()).format();
  const endOfMonth   = moment.utc(moment().endOf('month').toDate()).format();

  return get('calendars', {
    params: {
      filter: {
        where: {
          and: [
            { created: { gte: startOfMonth }},
            { created: { lte: endOfMonth }}
          ]
        }
      }
    }
  }, res => {
    return res.data;
  });
};



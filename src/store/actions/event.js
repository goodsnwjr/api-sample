import { get, post, patch, del } from "../../lib/protocols";
import moment from "moment";

// actions
export const getList = () => {
  const startOfMonth = moment.utc(moment().startOf("month").toDate()).format();
  const endOfMonth = moment.utc(moment().endOf("month").toDate()).format();

  return get(
    "events",
    {
      params: {
        filter: {
          where: {
            and: [
              { start: { gte: startOfMonth } },
              { end: { lte: endOfMonth } },
            ],
          },
        },
      },
    },
    (res) => {
      return res.data;
    }
  );
};

export const getListCount = (_where) => {
  return get('events/count', {params : {
    where : _where || {}
  }}).then(res => {
    return res.count;
  })
}

export const createEvent = (data) => {
  return post("events", data, (res) => {
    return res.data.id;
  });
};

export const updateEvent = (id, data) => {
  return patch("events/" + id, data, (res) => {
    return res.data;
  });
};

export const deleteEvent = (id) => {
  return del("events/" + id, (res) => {
    return res.data;
  });
};

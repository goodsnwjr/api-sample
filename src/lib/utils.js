import Cookies from "universal-cookie";
import Moment from "moment";

export const getToday = () => {
  return Moment().format("YYYY-MM-DD");
};

export const getDefaultPageSize = () => {
  return 10;
};

export const isLoggedIn = () => {
  const cookies = new Cookies();
  return cookies.get("sfw-token");
};

export const logout = () => {
  const cookies = new Cookies();
  cookies.set("sfw-token", "", { path: "/" });
  window.location.href = "/";
};

export const getToken = () => {
  const cookies = new Cookies();
  return cookies.get("sfw-token");
};

export const setToken = (token) => {
  const cookies = new Cookies();
  cookies.set("sfw-token", token, { path: "/" });
};

export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  if (typeof obj !== "object") return true;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
};

export const getStoreId = () => {
  return 1;
};

export const filterUsableCouponsArray = (coupons) => {
  if (isEmpty(coupons)) {
    return [];
  }

  return coupons.filter((coupon) => !coupon.isRedeemed);
};

export const removeItemAndReturnArray = (array, target) => {
  const index = array.indexOf(target);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};

export const removeItemAndReturnNewObject = (obj, prop) => {
  let res = { ...obj };
  delete res[prop];
  return res;
};

export const checkEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const checkPhone = (phone) => {
  return /\d/.test(phone) && phone.length > 5;
};

export const checkSmsCode = (smsCode) => {
  return /\d/.test(smsCode) && smsCode.length < 5;
};

export const sliceString = (str, maxLength) => {
  const max = maxLength || 10;

  if (str.length > max) {
    return str.slice(0, max) + "...";
  } else {
    return str;
  }
};

export const addDashes = (f) => {
  if (f.length > 10) {
    return f.slice(0, 3) + "-" + f.slice(3, 7) + "-" + f.slice(7);
  } else {
    return f.slice(0, 3) + "-" + f.slice(3, 6) + "-" + f.slice(6);
  }
};

export const getNowYMD = (day) => {
  var dt = day || new Date();
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth() + 1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = y + "-" + m + "-" + d;
  return result;
};

export const checkSameObject = (obj1, obj2) => {
  let check = true;
  for (let key in obj1) {
    if (obj1[key] !== obj2[key]) {
      check = false;
      return check;
    }
  }
  return check;
};

export const getKeyNode = (key, tree) => {
  let n;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children && node.children.length) {
      if (node.children.some((item) => item.key === key)) {
        n = node.children.find((item) => item.key === key);
      } else if (getKeyNode(key, node.children)) {
        n = getKeyNode(key, node.children);
      }
    }
  }
  return n;
};

export const getCurrentKeyNode = (key, tree) => {
  let t = getKeyNode(key, tree);
  if (!t) {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.key === key) {
        t = node;
        break;
      }
    }
  }
  return t;
};

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children && node.children.length) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

export const generatePathString = (key, tree) => {
  let pathStrings = [];

  pathStrings.push(key);
  let s = getParentKey(key, tree);
  while (s) {
    pathStrings.push(s);
    s = getParentKey(s, tree);
  }

  return pathStrings.reverse().join(" > ");
};

export const generateKeyArray = (node, outKeys) => {
  outKeys.push(node.key);
  if (node.children && node.children.length) {
    node.children.map((x) => {
      return generateKeyArray(x, outKeys);
    });
  }
};

export const getLeafNodeList = (node, outKeys) => {
  if (node.children && node.children.length) {
    node.children.map((x) => {
      return getLeafNodeList(x, outKeys);
    });
  } else {
    outKeys.push(node.key);
  }
};

export function getPeriodParamsCreated(start, end) {
  if (!end) {
    return [];
  }
  let _start = start ? Moment(start) : Moment();
  let _end = end ? Moment(end) : Moment();

  if (end) {
    if (_end.diff(_start) < 0) {
      _end = _start;
    }
  }
  _start = _start.startOf("day");
  _end = _end.endOf("day");

  return [{ created: { gte: _start } }, { created: { lte: _end } }];
}

export function getPeriodParams(start, end) {
  if (!end) {
    return [];
  }
  let _start = start ? Moment(start) : Moment();
  let _end = end ? Moment(end) : Moment();

  if (end) {
    if (_end.diff(_start) < 0) {
      _end = _start;
    }
  }
  _start = _start.startOf("day");
  _end = _end.endOf("day");

  return [{ updated: { gte: _start } }, { updated: { lte: _end } }];
}

export function getCondition(_condition, isCreatedSet) {
  let condition = {};
  if (!_condition) {
    return condition;
  }
  const {
    start,
    end,
    searchType,
    keyword,
    onSale,
    bookId,
    status,
    branchID,
    state,
    address,
    name,
    branchName,
    tel,
    title,
    isRequested,
  } = _condition;
  if (start) {
    condition.and = isCreatedSet
      ? getPeriodParamsCreated(start, end)
      : getPeriodParams(start, end);
  }

  if (onSale) {
    condition.onSale = onSale;
  }

  if (bookId) {
    condition.bookId = bookId;
  }

  if (status) {
    condition.status = status;
  }

  if (branchID) {
    condition.branchID = branchID;
  }

  if (branchName) {
    condition.branchName = { like: branchName };
  }

  if (tel) {
    condition.tel = { like: tel };
  }

  if (title) {
    condition.title = { like: title };
  }

  if (state) {
    condition.state = state;
  }

  if (address) {
    condition.address = address;
  }

  if (name) {
    condition.name = { like: name };
  }

  if (isRequested) {
    condition.isRequested = isRequested;
  }

  if (keyword && searchType) {
    condition[searchType] = Array.isArray(keyword)
      ? { inq: keyword }
      : { like: keyword };
  }

  if (_condition.and) {
    condition = _condition;
  }

  return condition;
}

export function makeSearchParams({
  where,
  order = "updated DESC",
  page = 1,
  size = 10,
}) {
  let params = {
    filter: {
      skip: page ? (page - 1) * size : 0,
      limit: size,
      order,
    },
  };
  if (where) {
    params.filter.where = where;
  }
  return params;
}

export function extractInitialField(target, field, value, defaultValue) {
  if (value) {
    if (Array.isArray(defaultValue)) {
      return target.products.length
        ? [
            target.products.find(
              (x) => x[field] === target.match.params[field]
            )[value],
          ]
        : defaultValue;
    } else {
      return target.products.length
        ? target.products.find((x) => x[field] === target.match.params[field])[
            value
          ]
        : defaultValue;
    }
  } else {
    return target.products.length
      ? target.products.find((x) => x[field] === target.match.params[field])
      : {};
  }
}

export function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }
  return a;
}

export function getIdsArray(data) {
  if (!data || !data.length) {
    return [];
  }
  if (typeof data[0] === "string") {
    return data;
  }
  return [...data].map((d) => d.id);
}

export function setProductOrder(data, customOrder, page, size) {
  const orderByIndex = (item, i) => {
    if (page || size) {
      item.order = i + 1 + (page - 1) * size;
    } else {
      item.order = i + 1;
    }
    return item;
  };
  const list = customOrder
    ? data.map((product, i) => {
        let newProduct = { ...product };
        const target = customOrder.find((item) => item.id === product.id);
        if (target) {
          newProduct.order = target.order;
        } else {
          orderByIndex(newProduct, i);
        }
        return newProduct;
      })
    : data.map((product, i) => {
        let newProduct = { ...product };
        orderByIndex(newProduct, i);
        return newProduct;
      });
  return list;
}

export function getOptionLabel(key) {
  switch (key) {
    case "useSubscribe":
      return "구독하기";
    case "useHomeButton":
      return "홈 버튼";
    case "useTopButton":
      return "Top 버튼";
    case "useNavigation":
      return "네비게이션";
    default:
      return;
  }
}

export function swapObjectKeyValue(obj) {
  let swapped = {};
  Object.keys(obj).forEach((key) => {
    swapped[obj[key]] = key;
  });
  return swapped;
}

export function isEqualArray(array1, array2) {
  return JSON.stringify(array1) === JSON.stringify(array2);
}

export const setCookieMidnight = () => {
  const cookies = new Cookies();
  let value = Math.random().toString(36).substr(2, 9);

  // KR = UTC+9
  let today = new Date();
  let todayMidnight = new Date(
    new Date(today.setDate(today.getDate())).setUTCHours(15, 0, 0)
  ).toUTCString();

  return cookies.set("dmsmodal=" + value + ";path=/;expires=" + todayMidnight);
};

export const getModalCookie = () => {
  const cookies = new Cookies();
  return cookies.get("dmsmodal");
};

export const nullCheck = (target) => {
  return target &&
    target !== null &&
    target !== "" &&
    target !== undefined &&
    target.length !== 0
    ? true
    : false;
};

export const makeChannelUrl = (domain, channel, data) => {
  if (!domain) return;

  const _tab = channel.split("/");

  let url = domain;
  if (domain[domain.length - 1] !== "/") {
    url += "/";
  }

  if (data.event_by === "ss" && data.event_by_ss) {
    url += data.event_by_ss + "/";
  } else {
    url += _tab[1] + "/";
  }

  if (data.event_open_period) {
    url += data.event_open_period[0].substring(2).replace(/-/gi, "") + "/";
  }

  if (url.indexOf("localhost") === -1 && data) {
    if (data.status !== "approved") {
      url = url.replace("//", "//dev.");
    }
  }

  return url;
};

export const addEvetnProgressData = (key) => {
  switch (key) {
    case 0:
      return 13;
    case 1:
      return 44;
    case 2:
      return 75;
    case 3:
      return 100;
    default:
      return;
  }
};

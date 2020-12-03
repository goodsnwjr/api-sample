import axios from 'axios';
import { getToken } from './utils';

const production = 'https://sfw-api.ifdev.cc';
const sandbox = 'https://sfw-api.ifdev.cc'; // 'http://localhost:22751';
const development = 'http://localhost:22751';

const getAPIVersion = () => {
  return '';
};

const extractErrorMsg = error => {
  if (!error.response) {
    if (process.env.NODE_ENV === 'production') {
      // logout();
      // window.location.href = '/';
    } else {
      console.log(error);
    }
  } else {
    if (error.response.status !== 200) {
      if (error.response.data.path) {
        return error.response.statusText + ': ' + error.response.data.path;
      } else {
        return error.response.statusText;
      }
    }

    return error.response.data || '에러 발생';
  }
};

const getHost = () => {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REACT_APP_BUILD_MODE === 'sandbox') {
      return sandbox + '/api/' + getAPIVersion();
    } else {
      return production + '/api/' + getAPIVersion();
    }
  } else {
    // return production + '/api/' + getAPIVersion();
    return development + '/api/' + getAPIVersion();
  }
};

// config
const host = getHost();

export const getImageUrl = filename => {
  return (
    'https://s3-ap-northeast-1.amazonaws.com/utils.couponpapa.io/dms/' +
    filename.replace(/_/gi, '/')
  );
};

export const getApis = oper => {
  //return 'http://localhost:9883/api/imageprocesses/' + oper;
  return 'https://apis.ifdev.cc/api/imageprocesses/' + oper;
};

// api protocols
export const get = (path, data, callback) => {
  let options = data ? data : {};
  options.headers = {
    Accept: 'application/json',
    'X-Access-Token': getToken()
  };
  return axios
    .get(host + path, options)
    .then(response => {
      if (callback) {
        return callback(response);
      }
      return response.data;
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
};

export const post = (path, data, callback, withCredentials) => {
  return axios
    .post(host + path, data ? data : {}, {
      headers: {
        Accept: 'application/json',
        'X-Access-Token': getToken()
      },
      withCredentials: !!withCredentials
    })
    .then(response => {
      if (callback) {
        return callback(response);
      }
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
};

export const patch = (path, data, callback) => {
  return axios
    .patch(host + path, data ? data : {}, {
      headers: {
        Accept: 'application/json',
        'X-Access-Token': getToken()
      }
    })
    .then(response => {
      if (callback) {
        return callback(response);
      }
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
};

export const put = (path, data, callback) => {
  return axios
    .put(host + path, data ? data : {}, {
      headers: {
        Accept: 'application/json',
        'X-Access-Token': getToken()
      }
    })
    .then(response => {
      if (callback) {
        return callback(response);
      }
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
};

export const del = (path, callback) => {
  return axios
    .delete(host + path, {
      headers: {
        Accept: 'application/json',
        'X-Access-Token': getToken()
      }
    })
    .then(response => {
      if (callback) {
        return callback(response);
      }
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
};

export function postFile(path, data, cb, wc) {
  return axios
    .post(host + path + '?access_token=' + getToken(), data, {
      headers: {
        Accept: 'application/json',
        'content-Type': 'multipart/form-data'
      },
      withCredentials: wc ? true : false
    })
    .then(function(response) {
      if (cb) {
        return cb(response);
      }
    });
}

export function postImage(path, data) {
  return axios
    .post(host + path, data, {
      headers: {
        Accept: 'application/json',
        'content-Type': 'multipart/form-data',
        'X-Access-Token': getToken()
      },
      withCredentials: false
    })
    .then(function(response) {
      return response.data.imageUrl;
    });
}

export function getPreviewPDF(id, cvtString) {
  return axios
    .post(getApis('cmykPDF'), {
      cmsBookId: id,
      paramString: cvtString
    })
    .then(response => {
      return response.data.result.location;
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
}

export function getThumbnail(id) {
  return axios
    .post(getApis('thumbnail'), {
      cmsBookId: id
    })
    .then(response => {
      return response.data.result.location;
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
}

export function publish(id) {
  return axios
    .post(getApis('publish'), {
      cmsCatalogId: id
    })
    .then(response => {
      return response.data.result.location;
    })
    .catch(err => {
      throw extractErrorMsg(err);
    });
}

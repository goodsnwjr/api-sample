import { get, post, patch } from "../../lib/protocols";
import { getCondition, makeSearchParams } from "../../lib/utils";
import { setToken, logout } from "../../lib/utils";

export const GET_LIST = "ACCOUNT/LIST";
export const UPDATE_USER = "ACCOUNT/UPDATE";
export const GET_PROFILE = "ACCOUNT/GET_PROFILE";

export const Login = (id, pass) => {
  let email = id;
  if (email.indexOf("@") === -1) {
    email += "@sfw.acc";
  }

  return post(
    "users/login",
    {
      email: email,
      password: pass,
    },
    (res) => {
      if (
        (typeof res.data === "object" || typeof res.data === "function") &&
        res.data !== null
      ) {
        if (res.data.id) {
          setToken(res.data.id);
          window.location.href = "/";
        } else {
          throw Error("login fail");
        }
      } else {
        throw Error("login fail");
      }
    }
  );
};

export const getProfile = () => {
  return get("users/profile", null, (res) => {
    return res.data.result;
  });
};

export const getList = ({ condition, order, page = 1, size = 10 } = {}) => {
  return (dispatch) => {
    const where = getCondition(condition);
    const params = makeSearchParams({ where, page, size, order });

    return get(
      "users",
      {
        params: {
          ...params,
          filter: {
            ...(params.filter || {}),
            where: {
              ...(params?.filter?.where || {}),
              status: { neq: "deleted" },
            },
          },
        },
      },
      (res) => {
        if (page === 1) {
          getListCount(condition
            ? { ...where, status: { neq: "deleted" } }
            : { status: { neq: "deleted" } }).then((res2) => {
                dispatch({
                  type: GET_LIST,
                  payload: {
                    page,
                    list: res.data || [],
                    total: res2
                  },
                });
              })
        } else if (page > 1) {
          dispatch({
            type: GET_LIST,
            payload: {
              page,
              list: res.data || [],
            },
          });
        }
      }
    );
  };
};

export const getListCount = (_where) => {
  return get('users/count', {
    params : {
      where : _where || {}
    }
  }).then(res => {
    return res.count;
  })
}

export const update = (data) => {
  return (dispatch) => {
    return patch("users/" + data.id, data, (res) => {
      dispatch({
        type: UPDATE_USER,
        payload: res.data,
      });
    });
  };
};

export const changePassword = (data) => {
  return post("users/change-password", data, (res) => {
    if (res.status === 204) {
      logout();
    } else {
      alert("비밀번호 변경에 실패하였습니다");
    }
    window.location.href = "/account";
  });
};

export const save = (data) => {
  return post("users", data, (res) => {
    window.location.href = "/account";
  });
};

export const remove = (_data) => {
  return (dispatch) => {
    return new Promise((resolve) => {
      let data = _data;
      if (!Array.isArray(data)) {
        data = [_data];
      }
      const reqs = data.filter((v, i, a) => a.indexOf(v) === i);
      reqs
        .reduce((sequence, id) => {
          return sequence.then(() => {
            return patch("users/" + id, { status: "deleted" });
          });
        }, Promise.resolve())
        .then(() => {
          resolve();
          window.location.reload();
        });
    });
  };
};

export const Logout = (id, pass) => {
  return post("users/logout", {}, (res) => {
    setToken("");
    window.location.href = "/";
  });
};

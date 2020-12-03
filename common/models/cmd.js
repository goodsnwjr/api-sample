"use strict";

module.exports = (Cmd) => {
  const tencentcloud = require('tencentcloud-sdk-nodejs');

  const TrtcClient = tencentcloud.trtc.v20190722.Client;
  const models = tencentcloud.trtc.v20190722.Models;
  const Credential = tencentcloud.common.Credential;
  const ClientProfile = tencentcloud.common.ClientProfile;
  const HttpProfile = tencentcloud.common.HttpProfile;

  Cmd.dismissroom = (userId, cb) => {
    let cred = new Credential(process.env.TC_API_ID, process.env.TC_API_KEY);
    let httpProfile = new HttpProfile();
    httpProfile.endpoint = 'trtc.tencentcloudapi.com';
    let clientProfile = new ClientProfile();

    clientProfile.httpProfile = httpProfile;
    let client = new TrtcClient(cred, 'ap-guangzhou', clientProfile);
    let req = new models.DescribeRoomInformationRequest();

    const _startDate = new Date();
    _startDate.setDate(_startDate.getDate() - 1);

    let params = {
      'SdkAppId': process.env.SDK_API_ID,
      'StartTime': Math.floor(_startDate.getTime() / 1000),
      'EndTime': Math.floor(Date.now() / 1000),
      'PageSize': 100
    };

    req.from_json_string(JSON.stringify(params));
    client.DescribeRoomInformation(req, function(errMsg, response) {
      if (errMsg) {
        cb(errMsg);
        return;
      }

      const _res = JSON.parse(response.to_json_string());
      const _rs = _res.RoomList.find(x => x.UserId === userId);
      if (_rs) {
        let req = new models.DismissRoomRequest();
        let params = {
          'SdkAppId': process.env.SDK_API_ID,
          'RoomId': Number(_rs.RoomString)
        };

        req.from_json_string(JSON.stringify(params));
        client.DismissRoom(req, function(errMsg, response) {
          if (errMsg) {
            cb(errMsg);
            return;
          }
          cb(null, {
            message: 'ok'
          });
        });
      } else {
        cb(null, {
          message: 'no user'
        });
      }
    });
  };

  Cmd.dismissroomBySessionId = (sessionId, cb) => {
    let cred = new Credential(process.env.TC_API_ID, process.env.TC_API_KEY);
    let httpProfile = new HttpProfile();
    httpProfile.endpoint = 'trtc.tencentcloudapi.com';
    let clientProfile = new ClientProfile();

    clientProfile.httpProfile = httpProfile;
    let client = new TrtcClient(cred, 'ap-guangzhou', clientProfile);

    let req = new models.DismissRoomRequest();
    let params = {
      'SdkAppId': process.env.SDK_API_ID,
      'RoomId': sessionId
    };

    req.from_json_string(JSON.stringify(params));
    client.DismissRoom(req, function(errMsg, response) {
      if (errMsg) {
        cb(errMsg);
        return;
      }
      cb(null, {
        message: 'ok'
      });
    });
  };
};

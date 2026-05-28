/**
 * HTTP 请求封装 · 支持 JWT 认证
 */
const app = getApp();

const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, header = {} } = options;
    const baseUrl = app.globalData.baseUrl;
    const token = app.globalData.accessToken;

    const headers = {
      'Content-Type': 'application/json',
      ...header,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header: headers,
      success(res) {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          app.clearAuth();
          wx.redirectTo({ url: '/pages/login/login' });
          reject(new Error('登录已过期，请重新登录'));
        } else {
          const msg = res.data?.message || '请求失败';
          reject(new Error(msg));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
};

// GET 请求
const get = (url, data) => request({ url, method: 'GET', data });

// POST 请求
const post = (url, data) => request({ url, method: 'POST', data });

// PUT 请求
const put = (url, data) => request({ url, method: 'PUT', data });

// DELETE 请求
const del = (url, data) => request({ url, method: 'DELETE', data });

// 上传文件
const upload = (url, filePath, name = 'file') => {
  return new Promise((resolve, reject) => {
    const baseUrl = app.globalData.baseUrl;
    const token = app.globalData.accessToken;

    wx.uploadFile({
      url: `${baseUrl}${url}`,
      filePath,
      name,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      success(res) {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const data = JSON.parse(res.data);
          resolve(data);
        } else {
          reject(new Error('上传失败'));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '上传失败'));
      }
    });
  });
};

module.exports = { request, get, post, put, del, upload };

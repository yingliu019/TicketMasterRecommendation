/* step1: */
(function() {

  /* step2: add variables */
  /******* step2: variables *******/

  var user_id = '1111';
  var user_fullname = 'John';
  var lng = -122.08;
  var lat = 37.38;

  /* step 5: define init function */
  /**
   * Initialize major event handlers
   */
  function init() {
    // register event listeners
	/* step 18 : add login */
    document.querySelector('#login-form-btn').addEventListener('click', onSessionInvalid);
    document.querySelector('#login-btn').addEventListener('click', login);
    
    /* step 20 : add register */
    document.querySelector('#register-form-btn').addEventListener('click', showRegisterForm);
    document.querySelector('#register-btn').addEventListener('click', register);
    
    /* step 17: nearby, favorite, recommendation (only change url) */
    document.querySelector('#nearby-btn').addEventListener('click', loadNearbyItems);
    document.querySelector('#fav-btn').addEventListener('click', loadFavoriteItems);
    document.querySelector('#recommend-btn').addEventListener('click', loadRecommendedItems);
    validateSession();
    
    /* step 5.1 : valid session */ 
    // 验证这个用户是存在的
    onSessionValid({"user_id":"1111","name":"John Smith","status":"OK"});
  }

  /* step 6: define validateSession function */
  /**
   * Session
   */
  function validateSession() {
    onSessionInvalid();
    // The request parameters
    var url = './login';
    var req = JSON.stringify({});

    // display loading message
    showLoadingMessage('Validating session...');

    // make AJAX call
    ajax('GET', url, req,
      // session is still valid
      function(res) {
        var result = JSON.parse(res);

        if (result.status === 'OK') {
          onSessionValid(result);
        }
      });
  }

  function onSessionValid(result) {
    user_id = result.user_id;
    user_fullname = result.name;

    // 隐藏登陆注册表
    var loginForm = document.querySelector('#login-form');
    var registerForm = document.querySelector('#register-form');
    var itemNav = document.querySelector('#item-nav');
    var itemList = document.querySelector('#item-list');
    var avatar = document.querySelector('#avatar');
    var welcomeMsg = document.querySelector('#welcome-msg');
    var logoutBtn = document.querySelector('#logout-link');

    welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;

    // 隐藏和注册一些信息，要去step into看code是怎么写的
    showElement(itemNav);
    showElement(itemList);
    showElement(avatar);
    showElement(welcomeMsg);
    showElement(logoutBtn, 'inline-block');
    hideElement(loginForm);
    hideElement(registerForm);

    /* step 7: init Geolocation */
    initGeoLocation();
  }

  function onSessionInvalid() {
    var loginForm = document.querySelector('#login-form');
    var registerForm = document.querySelector('#register-form');
    var itemNav = document.querySelector('#item-nav');
    var itemList = document.querySelector('#item-list');
    var avatar = document.querySelector('#avatar');
    var welcomeMsg = document.querySelector('#welcome-msg');
    var logoutBtn = document.querySelector('#logout-link');

    hideElement(itemNav);
    hideElement(itemList);
    hideElement(avatar);
    hideElement(logoutBtn);
    hideElement(welcomeMsg);
    hideElement(registerForm);

    clearLoginError();
    showElement(loginForm);
  }

  function hideElement(element) {
    element.style.display = 'none';
  }

  function showElement(element, style) {
    var displayStyle = style ? style : 'block';
    element.style.display = displayStyle;
  }
  
  function showRegisterForm() {
    var loginForm = document.querySelector('#login-form');
    var registerForm = document.querySelector('#register-form');
    var itemNav = document.querySelector('#item-nav');
    var itemList = document.querySelector('#item-list');
    var avatar = document.querySelector('#avatar');
    var welcomeMsg = document.querySelector('#welcome-msg');
    var logoutBtn = document.querySelector('#logout-link');

    hideElement(itemNav);
    hideElement(itemList);
    hideElement(avatar);
    hideElement(logoutBtn);
    hideElement(welcomeMsg);
    hideElement(loginForm);
    
    clearRegisterResult();
    showElement(registerForm);
  }  
  
  /* step 8: define init Geolocation function */
  function initGeoLocation() {
	// navigator是response的api
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
    	/* step 8.1: onPositionUpdated function */
        onPositionUpdated,
        /* step 8.2: onLoadPositionFailed function */
        onLoadPositionFailed, {
          maximumAge: 60000
        });
      showLoadingMessage('Retrieving your location...');
    } else {
      onLoadPositionFailed();
    }
  }

  /* step 8.3: define onPositionUpdated function */
  function onPositionUpdated(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;

    /* step 9: loadNearbyItems function */
    loadNearbyItems();
  }

  /* step 8.4: define onLoadPositionFailed function */
  function onLoadPositionFailed() {
    console.warn('navigator.geolocation is not available');
    /* step 8.5: getLocationFromIP function */
    getLocationFromIP();
  }

  /* step 8.6: define getLocationFromIP function */
  function getLocationFromIP() {
    // get location from http://ipinfo.io/json
    var url = 'http://ipinfo.io/json'
    var data = null;

    ajax('GET', url, data, function(res) {
      var result = JSON.parse(res);
      if ('loc' in result) {
        var loc = result.loc.split(',');
        lat = loc[0];
        lng = loc[1];
      } else {
        console.warn('Getting location by IP failed.');
      }
      loadNearbyItems();
    });
  }

  // -----------------------------------
  // Login
  // -----------------------------------

  function login() {
    var username = document.querySelector('#username').value;
    var password = document.querySelector('#password').value;
    password = md5(username + md5(password));

    // The request parameters
    var url = './login';
    var req = JSON.stringify({
      user_id : username,
      password : password,
    });

    // log in 需要对后端做post请求
    ajax('POST', url, req,
      // successful callback
      function(res) {
        var result = JSON.parse(res);

        // successfully logged in
        if (result.status === 'OK') {
          onSessionValid(result);
        }
      },

      // error
      function() {
        showLoginError();
      },
      true);
  }

  function showLoginError() {
    document.querySelector('#login-error').innerHTML = 'Invalid username or password';
  }

  function clearLoginError() {
    document.querySelector('#login-error').innerHTML = '';
  }

  // -----------------------------------
  // Register
  // -----------------------------------

  function register() {
    var username = document.querySelector('#register-username').value;
    var password = document.querySelector('#register-password').value;
    var firstName = document.querySelector('#register-first-name').value;
    var lastName = document.querySelector('#register-last-name').value;
    
    if (username === "" || password == "" || firstName === "" || lastName === "") {
    	showRegisterResult('Please fill in all fields');
    	return
    }
    
    if (username.match(/^[a-z0-9_]+$/) === null) {
    	showRegisterResult('Invalid username');
    	return
    }
    
    password = md5(username + md5(password));

    // The request parameters
    var url = './register';
    var req = JSON.stringify({
      user_id : username,
      password : password,
      first_name: firstName,
      last_name: lastName,
    });

    ajax('POST', url, req,
      // successful callback
      function(res) {
        var result = JSON.parse(res);

        // successfully logged in
        if (result.status === 'OK') {
        	showRegisterResult('Succesfully registered');
        } else {
        	showRegisterResult('User already existed');
        }
      },

      // error
      function() {
    	  showRegisterResult('Failed to register');
      },
      true);
  }

  function showRegisterResult(registerMessage) {
    document.querySelector('#register-result').innerHTML = registerMessage;
  }

  function clearRegisterResult() {
    document.querySelector('#register-result').innerHTML = '';
  }

  /* step3: 创建helper函数 */
  // 
  // -----------------------------------
  // Helper Functions
  // -----------------------------------

  /**
   * A helper function that makes a navigation button active
   *
   * @param btnId - The id of the navigation button
   */
  function activeBtn(btnId) {
	// 把button加成active的类
    var btns = document.querySelectorAll('.main-nav-btn'); // 选择元素

    // deactivate all navigation buttons
    for (var i = 0; i < btns.length; i++) {
      btns[i].className = btns[i].className.replace(/\bactive\b/, '');
    }

    // active the one that has id = btnId
    var btn = document.querySelector('#' + btnId);
    btn.className += ' active'; // 对应要在css中加亮处理
  }

  function showLoadingMessage(msg) {
	// 显示信息
    var itemList = document.querySelector('#item-list'); //找到地方显示
    itemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i> ' +
      msg + '</p>';
  }

  function showWarningMessage(msg) {
    var itemList = document.querySelector('#item-list');
    itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i> ' +
      msg + '</p>';
  }

  function showErrorMessage(msg) {
    var itemList = document.querySelector('#item-list');
    itemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-circle"></i> ' +
      msg + '</p>';
  }

  /**
   * A helper function that creates a DOM element <tag options...>
   * @param tag
   * @param options
   * @returns {Element}
   */
  function $create(tag, options) { // $为函数名的一种，不是jquery的表现形式
	// options 有class和id, tag有l1 标签for example
    var element = document.createElement(tag); //dom自带的接口创建的元素
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        element[key] = options[key];
      }
    }
    return element;
  }

  /**
   * AJAX helper
   *
   * @param method - GET|POST|PUT|DELETE
   * @param url - API end point
   * @param data - request payload data
   * @param successCallback - Successful callback function, 回调函数
   * @param errorCallback - Error callback function
   */
  function ajax(method, url, data, successCallback, errorCallback) { 
	// 不是js自带的ajax，对ajax做类封装
    var xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    xhr.onload = function() {
      if (xhr.status === 200) {
        successCallback(xhr.responseText);
      } else {
        errorCallback();
      }
    };

    xhr.onerror = function() {
      // 失败的时候进行的调用
      console.error("The request couldn't be completed.");
      errorCallback();
    };

    if (data === null) {
      xhr.send();
    } else {
      xhr.setRequestHeader("Content-Type",
        "application/json;charset=utf-8");
      xhr.send(data);
    }
  }

  // -------------------------------------
  // AJAX call server-side APIs
  // -------------------------------------

  /* step 10: define loadNearbyItems function */
  /**
   * API #1 Load the nearby items API end point: [GET]
   * /search?user_id=1111&lat=37.38&lon=-122.08
   */
  function loadNearbyItems() {
    console.log('loadNearbyItems');
    activeBtn('nearby-btn'); // 标签高亮处理

    // The request parameters
    var url = './search';
    var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
    var data = null;  // get request 不需要data

    // display loading message
    showLoadingMessage('Loading nearby items...');

    // make AJAX call
    ajax('GET', url + '?' + params, data,
      // successful callback
      function(res) {
        var items = JSON.parse(res); // res是从后台拿到的数据
        if (!items || items.length === 0) {
          showWarningMessage('No nearby item.');
        } else {
          /* step 11: listItems function */ 
          listItems(items);
        }
      },
      // failed callback
      function() {
        showErrorMessage('Cannot load nearby items.');
      }
    );  // 完成向后台要数据的过程
  }

  /**
   * API #2 Load favorite (or visited) items API end point: [GET]
   * /history?user_id=1111
   */
  function loadFavoriteItems() {
    activeBtn('fav-btn');

    // request parameters
    var url = './history';
    var params = 'user_id=' + user_id;
    var req = JSON.stringify({});

    // display loading message
    showLoadingMessage('Loading favorite items...');

    // make AJAX call
    ajax('GET', url + '?' + params, req, function(res) {
      var items = JSON.parse(res);
      if (!items || items.length === 0) {
        showWarningMessage('No favorite item.');
      } else {
        listItems(items);
      }
    }, function() {
      showErrorMessage('Cannot load favorite items.');
    });
  }

  /**
   * API #3 Load recommended items API end point: [GET]
   * /recommendation?user_id=1111
   */
  function loadRecommendedItems() {
    activeBtn('recommend-btn');

    // request parameters
    var url = './recommendation' + '?' + 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
    var data = null;

    // display loading message
    showLoadingMessage('Loading recommended items...');

    // make AJAX call
    ajax('GET', url, data,
      // successful callback
      function(res) {
        var items = JSON.parse(res);
        if (!items || items.length === 0) {
          showWarningMessage('No recommended item. Make sure you have favorites.');
        } else {
          listItems(items);
        }
      },
      // failed callback
      function() {
        showErrorMessage('Cannot load recommended items.');
      }
    );
  }

  /* step 16: define changeFavoriteItem function */
  /**
   * API #4 Toggle favorite (or visited) items
   *
   * @param item_id - The item business id
   *
   * API end point: [POST]/[DELETE] /history request json data: {
   * user_id: 1111, visited: [a_list_of_business_ids] }
   */
  function changeFavoriteItem(item_id) {
    // check whether this item has been visited or not
    var li = document.querySelector('#item-' + item_id);
    var favIcon = document.querySelector('#fav-icon-' + item_id);
    var favorite = !(li.dataset.favorite === 'true');

    // request parameters
    var url = './history';
    var req = JSON.stringify({
      user_id: user_id,
      favorite: [item_id]
    });
    var method = favorite ? 'POST' : 'DELETE';

    ajax(method, url, req,
      // successful callback
      function(res) {
        var result = JSON.parse(res);
        if (result.status === 'OK' || result.result === 'SUCCESS') {
          li.dataset.favorite = favorite;
          favIcon.className = favorite ? 'fa fa-heart' : 'fa fa-heart-o';
        }
      });
  }

  /* step 12: define listItems function */
  // -------------------------------------
  // Create item list
  // -------------------------------------

  /**
   * List recommendation items base on the data received
   *
   * @param items - An array of item JSON objects
   */
  function listItems(items) { // 逐条显示数据的地方
    var itemList = document.querySelector('#item-list'); // 找到显示位置
    itemList.innerHTML = ''; // clear current results

    for (var i = 0; i < items.length; i++) {
      /* step 13: addItem function */
      addItem(itemList, items[i]);
    }
  }

  /**
   * Add a single item to the list
   *
   * @param itemList - The <ul id="item-list"> tag (DOM container)
   * @param item - The item data (JSON object)
   *
   <li class="item">
   <img alt="item image" src="https://s3-media3.fl.yelpcdn.com/bphoto/EmBj4qlyQaGd9Q4oXEhEeQ/ms.jpg" />
   <div>
   <a class="item-name" href="#" target="_blank">Item</a>
   <p class="item-category">Vegetarian</p>
   <div class="stars">
   <i class="fa fa-star"></i>
   <i class="fa fa-star"></i>
   <i class="fa fa-star"></i>
   </div>
   </div>
   <p class="item-address">699 Calderon Ave<br/>Mountain View<br/> CA</p>
   <div class="fav-link">
   <i class="fa fa-heart"></i>
   </div>
   </li>
   */
  

  /* step 14: define addItem function */
  function addItem(itemList, item) {  // 一个item对应一个li
    var item_id = item.item_id;

    // create the <li> tag and specify the id and class attributes
    var li = $create('li', {  // 创建l1标签
      id: 'item-' + item_id,
      className: 'item'
    });

    // set the data attribute ex. <li data-item_id="G5vYZ4kxGQVCR" data-favorite="true">
    li.dataset.item_id = item_id;
    li.dataset.favorite = item.favorite;

    // item image 增加imagine信息
    if (item.image_url) {
      li.appendChild($create('img', { src: item.image_url }));
    } else {
      li.appendChild($create('img', {
        src: 'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'
      }));
    }
    // section
    var section = $create('div');

    // title
    var title = $create('a', {  // 增加a标签，a标签对属性是以下
      className: 'item-name',
      href: item.url,  // 增加图片信息
      target: '_blank'
    });
    title.innerHTML = item.name;
    section.appendChild(title);  // 之前是空的，之后有title的element的信息

    // category
    var category = $create('p', {
      className: 'item-category'
    });
    category.innerHTML = 'Category: ' + item.categories.join(', ');
    section.appendChild(category);

    // stars
    var stars = $create('div', {
      className: 'stars'
    });

    for (var i = 0; i < item.rating; i++) {
      var star = $create('i', {
        className: 'fa fa-star'
      });
      stars.appendChild(star);
    }

    if (('' + item.rating).match(/\.5$/)) {
      stars.appendChild($create('i', {
        className: 'fa fa-star-half-o'
      }));
    }

    section.appendChild(stars);

    li.appendChild(section);

    // address
    var address = $create('p', {
      className: 'item-address'
    });

    // ',' => '<br/>',  '\"' => ''
    address.innerHTML = item.address.replace(/,/g, '<br/>').replace(/\"/g, '');
    li.appendChild(address);

    // favorite link
    var favLink = $create('p', {
      className: 'fav-link'
    });

    favLink.onclick = function() { // 添加on click事件
      /* step 15: changeFavoriteItem function */
      changeFavoriteItem(item_id);
    };

    favLink.appendChild($create('i', {
      id: 'fav-icon-' + item_id,
      className: item.favorite ? 'fa fa-heart' : 'fa fa-heart-o'
    }));

    li.appendChild(favLink);
    itemList.appendChild(li);  // 此时nearby就会display一个item出来
  }

  /* step 4: main function(entrance) */
  // js有提升，放在最后也可以
  init();

})();

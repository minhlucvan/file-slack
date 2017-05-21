// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
var config = {
  apiKey: "AIzaSyB9xXETv567zWyhbut_QEu9wbN0kPfW8VM",
  authDomain: "file-slack.firebaseapp.com",
  databaseURL: "https://file-slack.firebaseio.com",
  projectId: "file-slack",
  storageBucket: "file-slack.appspot.com",
  messagingSenderId: "210753911904"
};

firebase.initializeApp(config);
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  if(payload.data.by == firebase.auth.currentUser.uid){
    return;
  }
  // Customize notification here
  const notify = payload.notification; 
  const notificationTitle = notify.title;
  const notificationOptions = {
    body: notify.body,
    click_action: notify.click_action,
    icon: 'http://thongtintuyensinh.vn/upload/coltech_62599.jpg'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
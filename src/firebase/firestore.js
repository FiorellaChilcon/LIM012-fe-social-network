import { renderPost } from '../templates/post.js';

// const db = firebase.firestore();

export const getData = (callback, collectionName) => firebase.firestore().collection(collectionName)
  .onSnapshot((docs) => {
    const data = [];
    docs.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    callback(data);
  });

export const getDocument = (collectionName, docId, callback) => firebase.firestore().collection(collectionName).doc(docId)
  .get().then((doc) => {
    callback(doc);
  });

export const firstTimeUser = (userId, displayName, profilePhoto) => {
  return firebase.firestore().collection('users').doc(userId).get().then((doc) => {
    if (!doc.exists) {
      firebase.firestore().collection('users').doc(userId).set({
        userName: displayName,
        userPhoto: profilePhoto,
        coverPhoto: '',
        bio: '',
        myLikes: [],
        myPosts: [],
        myComments: [],
      });
    }
  });
};

export const getPosts = (userId, element, query, value) => {
  return firebase.firestore().collection('posts').where(query, '==', value).orderBy('timestamp', 'desc').onSnapshot((postsDocuments) => {
    const changes = postsDocuments.docChanges();
    changes.forEach((change) => {
      if (change.type === 'added') {
        renderPost(userId, change.doc, element);
      }
    });
  });
};

export const addDocumentIdToUserCollection = (userId, docId, field) => {
  return firebase.firestore().collection('users').doc(userId).update({
    [field]: firebase.firestore.FieldValue.arrayUnion(docId),
  });
};

export const addPost = (userId, content, photo, visibility) => {
  return firebase.firestore().collection('posts').add({
    userId,
    content,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    photo,
    visibility,
    likes: 0,
  });
};
export const addComment = (userId, postId, content) => {
  return firebase.firestore().collection('comments').add({
    userId,
    postId,
    content,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
};
export const updateDocument = (collection, docId, field, value) => {
  return firebase.firestore().collection(collection).doc(docId).update({
    [field]: value,
  });
};
export const deleteDocument = (collection, docId) => firebase.firestore().collection(collection).doc(docId).delete();

export const deleteDocumentIdFromUserCollection = (userId, docId, field) => {
  return firebase.firestore().collection('users').doc(userId).update({
    [field]: firebase.firestore.FieldValue.arrayRemove(docId),
  });
};


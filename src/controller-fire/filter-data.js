import { renderPost } from '../templates/post.js';
import { renderComment } from '../templates/comment.js';

export const getPosts = (userId, element, query, value) => firebase.firestore().collection('posts').where(query, '==', value).orderBy('timestamp', 'asc')
  .onSnapshot((postsDocuments) => {
    const changes = postsDocuments.docChanges();
    changes.forEach((change) => {
      if (change.type === 'added') {
        renderPost(userId, change.doc, element);
      } else if (change.type === 'removed') {
        const div = document.getElementById(change.doc.id);
        element.removeChild(div);
      } else if (change.type === 'modified') {
        const div = document.getElementById(change.doc.id);
        const contentTag = div.querySelector('.main-post p');
        contentTag.textContent = change.doc.data().content;
        const likeCounter = div.querySelector('.like-counter');
        likeCounter.textContent = change.doc.data().likes;
        if (window.location.hash === '#/home' && change.doc.data().visibility === 'private') {
          element.removeChild(div);
        }
      }
    });
  });

export const getComments = userId => firebase.firestore().collection('comments').orderBy('timestamp', 'asc').onSnapshot((commentDocuments) => {
  firebase.firestore().collection('posts').get().then((posts) => {
    let postsGroup;
    if (window.location.hash === '#/home') {
      postsGroup = posts.docs.filter(post => post.data().visibility === 'public');
    } else if (window.location.hash === '#/profile') {
      postsGroup = posts.docs.filter(post => post.data().userId === userId);
    }
    postsGroup.forEach((post) => {
      const commentContainer = document.getElementById(`comment-container-${post.id}`);
      commentContainer.innerHTML = '';
      const postContainer = document.getElementById(post.id);
      const commentCounter = postContainer.querySelector('.comments-counter');
      // eslint-disable-next-line max-len
      const postComments = commentDocuments.docs.filter(change => change.data().postId === post.id);
      if (postComments.length === 0) {
        commentCounter.innerHTML = 0;
      }
      postComments.forEach((comment) => {
        renderComment(userId, comment, commentContainer);
        commentCounter.innerHTML = commentContainer.childElementCount;
      });
    });
  });
});

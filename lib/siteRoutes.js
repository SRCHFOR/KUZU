FlowRouter.route('/', {
  name: 'home',
  action() {
    BlazeLayout.render('HomeLayout', { main: 'Home' })
  },
})

FlowRouter.notfound = {
  action() {
    BlazeLayout.render('PageNotFound');
  }
}

describe('Admin Actions', () => {
    let adminActions;
  
    beforeEach(() => {
      adminActions = document.createElement('ul');
      adminActions.id = 'adminActions';
      document.body.appendChild(adminActions);
    });
  
    afterEach(() => {
      document.body.removeChild(adminActions);
      adminActions = null;
    });
  
    test('Admin actions should be displayed', () => {
      displayAdminActions();
      const actionItems = adminActions.querySelectorAll('li');
      expect(actionItems.length).toBe(3); // Assuming there are 3 admin actions
    });
  });
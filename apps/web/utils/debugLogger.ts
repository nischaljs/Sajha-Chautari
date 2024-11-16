// debugLogger.ts
export const debugLogger = {
    socket: (event: string, data: any) => {
      console.group(`🔌 Socket Event: ${event}`);
      console.log('Payload:', data);
      console.groupEnd();
    },
    
    state: (action: string, prevState: any, newState: any) => {
      console.group(`🔄 State Update: ${action}`);
      console.log('Previous:', prevState);
      console.log('New:', newState);
      console.groupEnd();
    },
    
    error: (context: string, error: any) => {
      console.group(`❌ Error in ${context}`);
      console.error('Error:', error);
      console.trace();
      console.groupEnd();
    },
    
    connection: (userId: string, spaceId: string) => {
      console.group('🌐 Connection Info');
      console.log('User ID:', userId);
      console.log('Space ID:', spaceId);
      console.groupEnd();
    }
  };
// Fixed WebSocket onmessage handler
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('WS Message received:', message);
  console.log('Current Request ID (frontend state - from ref):', currentRequestIdRef.current);
  console.log('Message Request ID (from backend):', message.request_id);

  // For debugging - let's see what we're working with
  console.log('Message type:', message.type);
  console.log('Agent ID:', message.agent_id);

  if (message.type === 'individual_response') {
    // Process individual responses regardless of request ID matching for now
    // We can add back request ID checking later once we confirm the flow works
    console.log('Processing individual response from agent:', message.agent_id);
    
    setResponsesRef.current(prev => {
      const newResponses = { ...prev };
      newResponses[message.agent_id] = {
        content: message.content,
        version: message.version,
        tools: message.tools || [],
        error: message.error,
        agent_id: message.agent_id
      };
      console.log('Updated individual responses:', newResponses);
      return newResponses;
    });
    
  } else if (message.type === 'merged_response') {
    console.log('Processing merged response');
    
    setMergedResponseRef.current({
      content: message.content,
      agent_id: 'merged',
      reasoning: message.reasoning,
      error: message.error,
      source_agents: message.source_agents || []
    });
    
    setIsLoadingRef.current(false);
    console.log('Updated merged response and set isLoading to false');
    
  } else if (message.type === 'system_error') {
    console.error('System Error from Backend:', message.error, message.details);
    setIsLoadingRef.current(false);
    setMergedResponseRef.current({
      content: `A system error occurred: ${message.error || 'Unknown error'}`,
      agent_id: 'system_error',
      error: message.error,
      reasoning: JSON.stringify(message.details || {})
    });
    
  } else if (message.type === 'error') {
    console.error('Request-specific Error from Backend:', message.error);
    setIsLoadingRef.current(false);
    setMergedResponseRef.current({
      content: `An error occurred during processing: ${message.error}`,
      agent_id: 'request_error',
      error: message.error
    });
    
  } else {
    console.warn("WS Message received but not processed (unexpected type):", message);
    console.warn("Frontend ReqID:", currentRequestIdRef.current);
  }
};
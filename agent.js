// Official ElevenLabs JavaScript SDK Implementation
// Docs: https://elevenlabs.io/docs/agents-platform/libraries/java-script

import { Conversation } from 'https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm';


// Proactive Context Manager
class ProactiveContextManager {
    constructor(agent) {
        this.agent = agent;
        this.currentContext = null;
        this.lastContext = null;
        this.idleTimer = null;
        this.hoveredElement = null;
        this.currentSection = 'overview';
        
        this.initializeTracking();
    }
    
    initializeTracking() {
        // Track mouse movements and hovers
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Track scroll position
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.detectCurrentSection(), 100);
        });
        
        // Track idle time
        this.resetIdleTimer();
        ['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.resetIdleTimer());
        });
        
        // Track page changes
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.handlePageChange(page);
            });
        });
    }
    
    handleMouseMove(e) {
        const element = e.target;
        
        // Detect hover on specific elements
        if (element.classList.contains('pricing-card')) {
            this.setContext('pricing-card', element);
        } else if (element.classList.contains('event-card')) {
            this.setContext('event-card', element);
        } else if (element.classList.contains('feature-card')) {
            this.setContext('feature-card', element);
        } else if (element.closest('#event-creation-form')) {
            this.setContext('event-form', element);
        } else if (element.classList.contains('cta-btn') || element.classList.contains('btn-primary')) {
            this.setContext('cta-button', element);
        }
    }
    
    setContext(contextType, element) {
        if (this.currentContext !== contextType) {
            this.lastContext = this.currentContext;
            this.currentContext = contextType;
            this.hoveredElement = element;
            
            // Send contextual update to agent if conversation is active
            if (this.agent.conversation && this.agent.isActive) {
                this.sendContextToAgent(contextType, element);
            }
        }
    }
    
    sendContextToAgent(contextType, element) {
        let contextMessage = '';
        
        switch(contextType) {
            case 'pricing-card':
                const planName = element.querySelector('.pricing-name')?.textContent || 'a plan';
                contextMessage = `User is hovering over the ${planName} pricing plan. Consider offering to explain its features or compare it to other plans.`;
                break;
                
            case 'event-card':
                const eventName = element.querySelector('.event-title')?.textContent || 'an event';
                contextMessage = `User is looking at the event "${eventName}". You could offer more details or help them reserve a seat.`;
                break;
                
            case 'feature-card':
                const featureName = element.querySelector('.feature-title')?.textContent || 'a feature';
                contextMessage = `User is examining the ${featureName} feature. Consider explaining it in more detail.`;
                break;
                
            case 'event-form':
                const focusedField = element.closest('.form-group')?.querySelector('label')?.textContent;
                if (focusedField) {
                    contextMessage = `User is looking at the ${focusedField} field in the event creation form. Offer to help fill it.`;
                }
                break;
                
            case 'cta-button':
                contextMessage = `User is hovering over a call-to-action button. They might be ready to take action.`;
                break;
        }
        
        if (contextMessage && this.agent.conversation) {
            this.agent.conversation.sendContextualUpdate(contextMessage);
        }
    }
    
    detectCurrentSection() {
        const sections = document.querySelectorAll('.page');
        let currentSection = 'overview';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });
        
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.handleSectionChange(currentSection);
        }
    }
    
    handleSectionChange(section) {
        if (this.agent.conversation && this.agent.isActive) {
            const messages = {
                'overview': 'User is now viewing the overview page with platform features.',
                'events': 'User is browsing the events page with upcoming screenings.',
                'pricing': 'User is looking at pricing plans.',
                'create-event': 'User is on the event creation page.'
            };
            
            const message = messages[section];
            if (message) {
                this.agent.conversation.sendContextualUpdate(message);
            }
        }
    }
    
    handlePageChange(page) {
        this.currentSection = page;
        
        // Proactively offer help based on page
        if (this.agent.isActive && this.agent.conversation) {
            setTimeout(() => {
                const suggestions = {
                    'pricing': 'Would you like me to help you compare the pricing plans or explain any features?',
                    'events': 'I can help you find specific events or reserve a seat. Just let me know!',
                    'create-event': 'Ready to create your event? I can help you fill out the form. Just tell me the details!'
                };
                
                if (suggestions[page]) {
                    // Agent will naturally respond to this context
                    this.agent.conversation.sendContextualUpdate(
                        `User navigated to ${page} page. Be proactive and offer: "${suggestions[page]}"`
                    );
                }
            }, 2000); // Wait 2 seconds before offering help
        }
    }
    
    resetIdleTimer() {
        clearTimeout(this.idleTimer);
        
        // If user is idle for 30 seconds and agent is active
        this.idleTimer = setTimeout(() => {
            if (this.agent.isActive && this.agent.conversation) {
                this.agent.conversation.sendContextualUpdate(
                    'User has been idle for 30 seconds. Proactively ask if they need help or have any questions about what they\'re looking at.'
                );
            }
        }, 30000);
    }
}
class CinewaveAgent {
    constructor() {
    this.conversation = null;
    this.isOpen = false;
    this.isActive = false;
    this.agentId = 'agent_5601kcnz69gsfq5vngpe3qj3mrtf';
    
    this.initializeDOM();
    this.initializeEventListeners();
    
    // Initialize proactive context manager
    this.contextManager = new ProactiveContextManager(this);
}
    
    initializeDOM() {
        this.toggle = document.getElementById('agent-toggle');
        this.panel = document.getElementById('agent-panel');
        this.closeBtn = document.getElementById('agent-close');
        this.micBtn = document.getElementById('agent-mic');
        this.input = document.getElementById('agent-input');
        this.sendBtn = document.getElementById('agent-send');
        this.messages = document.getElementById('agent-messages');
        this.statusText = document.getElementById('agent-status');
    }
    
    initializeEventListeners() {
        this.toggle.addEventListener('click', () => this.togglePanel());
        this.closeBtn.addEventListener('click', () => this.closePanel());
        this.micBtn.addEventListener('click', () => this.toggleVoice());
        this.sendBtn.addEventListener('click', () => this.sendTextMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendTextMessage();
        });
        this.input.addEventListener('input', () => {
            if (this.conversation) {
                this.conversation.sendUserActivity();
            }
        });
    }
    
    togglePanel() {
        this.isOpen ? this.closePanel() : this.openPanel();
    }
    
    openPanel() {
        this.panel.classList.remove('hidden');
        this.isOpen = true;
    }
    
    closePanel() {
        this.panel.classList.add('hidden');
        this.isOpen = false;
        if (this.conversation) this.endConversation();
    }
    
    async toggleVoice() {
        this.isActive ? this.endConversation() : await this.startConversation();
    }
    
    async startConversation() {
        try {
            this.updateStatus('Connecting...');
            console.log('🎬 Requesting microphone...');
            
            // Request microphone
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microphone granted');
            
            console.log('🚀 Starting session...');
            
            // Start session - EXACT syntax from official JavaScript SDK docs
            this.conversation = await Conversation.startSession({
                agentId: this.agentId,
                
                // Client tools
clientTools: {
    navigateToOverview: async () => {
        this.navigateToPage('overview');
        return 'Navigated to overview page';
    },
    navigateToEvents: async () => {
        this.navigateToPage('events');
        return 'Navigated to events page';
    },
    navigateToPricing: async () => {
        this.navigateToPage('pricing');
        return 'Navigated to pricing page';
    },
    navigateToCreateEvent: async () => {
        this.navigateToPage('create-event');
        return 'Navigated to event creation form. I can help you fill it out. Just tell me the details!';
    },
    setEventName: async (params) => {
        const input = document.getElementById('event-name');
        if (input) {
            input.value = params.name;
            input.classList.add('filled');
            return `Event name set to "${params.name}"`;
        }
        return 'Could not set event name';
    },
    setEventType: async (params) => {
        const select = document.getElementById('event-type');
        if (select) {
            const type = params.type.toLowerCase();
            select.value = type;
            select.classList.add('filled');
            return `Event type set to ${type}`;
        }
        return 'Could not set event type';
    },
    setEventDate: async (params) => {
        const input = document.getElementById('event-date');
        if (input) {
            input.value = params.date;
            input.classList.add('filled');
            return `Event date set to ${params.date}`;
        }
        return 'Could not set event date';
    },
    setEventTime: async (params) => {
        const input = document.getElementById('event-time');
        if (input) {
            input.value = params.time;
            input.classList.add('filled');
            return `Event time set to ${params.time}`;
        }
        return 'Could not set event time';
    },
    setEventDescription: async (params) => {
        const textarea = document.getElementById('event-description');
        if (textarea) {
            textarea.value = params.description;
            textarea.classList.add('filled');
            return `Event description set`;
        }
        return 'Could not set event description';
    },
    setEventDuration: async (params) => {
        const input = document.getElementById('event-duration');
        if (input) {
            input.value = params.duration;
            input.classList.add('filled');
            return `Event duration set to ${params.duration} minutes`;
        }
        return 'Could not set event duration';
    },
    clearEventForm: async () => {
        const form = document.getElementById('event-creation-form');
        if (form) {
            form.reset();
            document.querySelectorAll('.filled').forEach(el => el.classList.remove('filled'));
            return 'Event form cleared';
        }
        return 'Could not clear form';
    }
},
                
                // Callbacks
                onConnect: () => {
                    console.log('✅ Connected');
                    this.isActive = true;
                    this.micBtn.classList.add('active');
                    this.updateStatus('Listening...', 'active');
                },
                
                onDisconnect: () => {
                    console.log('🔌 Disconnected');
                    this.isActive = false;
                    this.micBtn.classList.remove('active');
                    this.updateStatus('Ready to help');
                },
                
                onMessage: (message) => {
                    if (message.type === 'transcript') {
                        if (message.role === 'user' && message.is_final) {
                            this.addMessage('user', message.text);
                        } else if (message.role === 'agent' && message.is_final) {
                            this.addMessage('bot', message.text);
                        }
                    }
                },
                
                onModeChange: (mode) => {
                    if (mode.mode === 'speaking') {
                        this.updateStatus('Speaking...', 'speaking');
                    } else if (mode.mode === 'listening') {
                        this.updateStatus('Listening...', 'active');
                    }
                },
                
                onError: (error) => {
                    console.error('❌ Error:', error);
                    this.addMessage('bot', 'Sorry, an error occurred.');
                    this.endConversation();
                }
            });
            
            console.log('🎉 Session started!');
            
        } catch (error) {
            console.error('❌ Failed:', error);
            this.addMessage('bot', `Failed: ${error.message}`);
            this.updateStatus('Failed');
        }
    }
    
    endConversation() {
        if (this.conversation) {
            this.conversation.endSession();
            this.conversation = null;
        }
        this.isActive = false;
        this.micBtn.classList.remove('active');
        this.updateStatus('Ready to help');
    }
    
    sendTextMessage() {
        const text = this.input.value.trim();
        if (!text) return;
        
        this.addMessage('user', text);
        this.input.value = '';
        
        if (this.conversation && this.isActive) {
            this.conversation.sendUserMessage(text);
        } else {
            this.startConversation().then(() => {
                if (this.conversation) {
                    setTimeout(() => this.conversation.sendUserMessage(text), 1500);
                }
            });
        }
    }
    
    addMessage(role, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `agent-message agent-message-${role}`;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        messageDiv.appendChild(contentDiv);
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
    
    updateStatus(text, className = '') {
        this.statusText.textContent = text;
        this.statusText.className = `agent-status ${className}`;
    }
    
    navigateToPage(pageName) {
        const navLink = document.querySelector(`[data-page="${pageName}"]`);
        if (navLink) navLink.click();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.cinewaveAgent = new CinewaveAgent();
    console.log('🎬 Agent ready');
});

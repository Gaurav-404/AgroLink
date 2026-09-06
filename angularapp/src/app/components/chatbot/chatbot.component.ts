import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

// ─── Each entry can have role-specific routes ─────────────────────────────────
// If a keyword is shared between Farmer & Seller (e.g. "chemical"),
// we use `routeByRole` so each role gets their own correct route.
const QA_WITH_NAV: {
  keywords:     string[];
  answer:       string;
  route?:       string;          // used when only one role OR public
  label?:       string;
  role?:        'Farmer' | 'Seller';
  routeByRole?: {                // used when keyword is shared across roles
    Farmer?: { route: string; label: string };
    Seller?: { route: string; label: string };
  };
}[] = [

  // ── Public ────────────────────────────────────────────────────────────────
  {
    keywords: ['register', 'sign up', 'signup', 'create account', 'new account',
               'how do i register', 'how to register'],
    answer:   '📋 Taking you to the Registration page now!',
    route:    '/register',
    label:    'Registration Page'
  },
  {
    keywords: ['login', 'log in', 'sign in', 'signin',
               'how do i login', 'how to login', 'how to log in', 'how do i log in'],
    answer:   '🔑 Taking you to the Login page now!',
    route:    '/login',
    label:    'Login Page'
  },

  // ── Shared keyword: chemical/agrochemical (Farmer = view, Seller = add/view) ─
  {
    keywords: ['agrochemical', 'chemical', 'fertilizer', 'pesticide',
               'view chemical', 'buy chemical', 'how do i view agrochemical',
               'how to view chemical', 'manage chemical'],
    answer:   '🧪 Taking you to Chemicals now!',
    routeByRole: {
      Farmer: { route: '/farmer/agrochemicals',    label: 'Agrochemicals'   },
      Seller: { route: '/seller/view-chemical',    label: 'View Chemicals'  }
    }
  },

  // ── Shared keyword: feedback ───────────────────────────────────────────────
  {
    keywords: ['add feedback', 'give feedback', 'write feedback', 'submit feedback',
               'leave review', 'add review', 'how do i add feedback',
               'how to add feedback', 'how do i give feedback'],
    answer:   '📝 Taking you to Add Feedback now!',
    routeByRole: {
      Farmer: { route: '/farmer/add-feedback',     label: 'Add Feedback'    },
      Seller: { route: '/seller/feedbacks',        label: 'Seller Feedbacks'}
    }
  },
  {
    keywords: ['view feedback', 'see feedback', 'all feedback', 'my feedback',
               'read feedback', 'how do i view feedback', 'how to see feedback',
               'seller feedback', 'customer feedback'],
    answer:   '⭐ Taking you to Feedbacks now!',
    routeByRole: {
      Farmer: { route: '/farmer/view-feedbacks',   label: 'View Feedbacks'  },
      Seller: { route: '/seller/feedbacks',        label: 'Seller Feedbacks'}
    }
  },

  // ── Shared keyword: requests ───────────────────────────────────────────────
  {
    keywords: ['my request', 'my order', 'track order', 'order status',
               'view request', 'incoming request', 'buyer request',
               'how do i view my request', 'how to view request'],
    answer:   '📋 Taking you to Requests now!',
    routeByRole: {
      Farmer: { route: '/farmer/my-requests',      label: 'My Requests'     },
      Seller: { route: '/seller/requests',         label: 'View Requests'   }
    }
  },

  // ── Shared keyword: home/dashboard ────────────────────────────────────────
  {
    keywords: ['home', 'dashboard', 'my dashboard', 'farmer home', 'seller home',
               'farmer dashboard', 'seller dashboard'],
    answer:   '🏠 Taking you to your Dashboard now!',
    routeByRole: {
      Farmer: { route: '/farmer/home',             label: 'Farmer Dashboard'},
      Seller: { route: '/seller/home',             label: 'Seller Dashboard'}
    }
  },

  // ── Farmer-only ────────────────────────────────────────────────────────────
  {
    keywords: ['add crop', 'list crop', 'sell crop', 'post crop', 'upload crop',
               'new crop', 'create crop', 'how do i add a crop', 'how to add crop',
               'how do i add crop', 'how can i add crop'],
    answer:   '🌾 Taking you to Add Crop now!',
    route:    '/farmer/add-crop',
    label:    'Add Crop',
    role:     'Farmer'
  },
  {
    keywords: ['my crop', 'view crop', 'see my crop', 'manage crop', 'my listing',
               'how do i view crop', 'how to view crop'],
    answer:   '📦 Taking you to My Crops now!',
    route:    '/farmer/my-crop',
    label:    'My Crops',
    role:     'Farmer'
  },

  // ── Seller-only ────────────────────────────────────────────────────────────
  {
    keywords: ['add chemical', 'sell chemical', 'post chemical', 'list chemical',
               'new chemical', 'how to add chemical', 'how do i add chemical'],
    answer:   '🧪 Taking you to Add Chemical now!',
    route:    '/seller/add-chemical',
    label:    'Add Chemical',
    role:     'Seller'
  },

  // ── Info only ─────────────────────────────────────────────────────────────
  {
    keywords: ['delivery', 'shipping', 'how long delivery', 'delivery time',
               'delivery info', 'how does delivery work'],
    answer:   '🚚 Delivery available across all Indian states. Estimated time: 2–5 business days. Shipping cost calculated at checkout. Farmers can also offer local pickup!'
  },
  {
    keywords: ['payment', 'how do i pay', 'payment method', 'upi', 'net banking', 'payout'],
    answer:   '💳 Accepted: UPI, Net Banking, Credit/Debit Cards, COD (select areas). Farmers receive payment within 3 business days of delivery.'
  },
  {
    keywords: ['refund', 'return', 'damaged', 'complaint', 'report issue', 'wrong item'],
    answer:   '⚠️ Report damaged goods within 24 hours via "My Requests" → select order → "Report Issue". Disputes resolved within 48 hours.'
  },
  {
    keywords: ['contact', 'support', 'help', 'customer care', 'helpline', 'contact us'],
    answer:   '📞 Email: support@AgroLink.com\nPhone: 1800-XXX-XXXX (Mon–Sat, 9AM–6PM IST)\nLive chat on the website during business hours.'
  },
  {
    keywords: ['what is agrolink', 'about agrolink', 'what does agrolink do'],
    answer:   '🌱 AgroLink connects farmers directly with buyers and sellers across India — no middlemen! List crops, browse produce, buy agrochemicals.'
  },
  {
    keywords: ['free', 'is it free', 'platform fee', 'charges', 'cost', 'any fee'],
    answer:   '✅ Completely free for farmers! Buyers pay a small 2% platform fee per transaction. No hidden charges.'
  },
];

export interface BotMessage extends ChatMessage {
  showLoginBtn?: boolean;
}

@Component({
  selector:    'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls:   ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;

  isOpen          = false;
  isLoading       = false;
  userInput       = '';
  showSuggestions = true;

  messages: BotMessage[] = [{
    role: 'bot',
    text: "👋 Hi! I'm AgroLink Assistant. Ask me about crops, chemicals, registration, feedback, or delivery!"
  }];

  suggestions = [
    { label: '👨‍🌾 Register',    query: 'How do I register?'          },
    { label: '🌾 Add Crop',      query: 'How do I add a crop?'         },
    { label: '🧪 Agrochemicals', query: 'How do I view agrochemicals?' },
    { label: '📝 Add Feedback',  query: 'How do I add feedback?'       },
    { label: '📦 My Requests',   query: 'How do I view my requests?'   },
    { label: '🔑 Login',         query: 'How do I login?'              },
  ];

  constructor(
    private chatbotService: ChatService,
    private authService:    AuthService,
    private router:         Router
  ) {}

  ngAfterViewChecked() { this.scrollToBottom(); }
  toggleChat()         { this.isOpen = !this.isOpen; }

  private isLoggedIn(): boolean  { return this.authService.isLoggedIn(); }
  private getRole(): string|null { return this.authService.getRole();    }

  private findMatch(text: string): typeof QA_WITH_NAV[0] | null {
    const lower = text.toLowerCase();
    return QA_WITH_NAV.find(item => item.keywords.some(kw => lower.includes(kw))) ?? null;
  }

  // ── Core logic: resolve route based on match + current user role ──────────
  private resolveNav(match: typeof QA_WITH_NAV[0]): {
    action:  'navigate' | 'login-first' | 'none';
    route?:  string;
    role?:   string;
    label?:  string;
  } {
    const loggedIn = this.isLoggedIn();
    const userRole = this.getRole(); // 'Farmer' | 'Seller' | 'Admin' | null

    // ── Case 1: routeByRole — keyword shared between Farmer & Seller ─────────
    if (match.routeByRole) {
      if (!loggedIn || !userRole) {
        // Not logged in → ask them to login, we don't know their role yet
        return { action: 'login-first', role: 'Farmer or Seller', label: 'this page' };
      }

      const roleKey = userRole as 'Farmer' | 'Seller';
      const target  = match.routeByRole[roleKey];

      if (target) {
        // ✅ Logged in and role has a route → navigate directly
        return { action: 'navigate', route: target.route };
      }

      if (userRole === 'Admin') {
        // Admin: default to Farmer route if available
        const adminTarget = match.routeByRole['Farmer'] ?? match.routeByRole['Seller'];
        if (adminTarget) return { action: 'navigate', route: adminTarget.route };
      }

      // Role doesn't match either side (shouldn't happen but safe fallback)
      return { action: 'login-first', role: 'Farmer or Seller', label: 'this page' };
    }

    // ── Case 2: Public route (no role required) ───────────────────────────────
    if (match.route && !match.role) {
      return { action: 'navigate', route: match.route };
    }

    // ── Case 3: Single-role route ─────────────────────────────────────────────
    if (match.route && match.role) {
      if (!loggedIn) {
        return { action: 'login-first', role: match.role, label: match.label };
      }
      const rightRole = userRole === match.role || userRole === 'Admin';
      if (rightRole) {
        return { action: 'navigate', route: match.route };
      }
      // Wrong role
      return { action: 'login-first', role: match.role, label: match.label };
    }

    // ── Case 4: Info only — no route at all ───────────────────────────────────
    return { action: 'none' };
  }

  sendMessage() {
    const msg = this.userInput.trim();
    if (!msg || this.isLoading) return;

    this.messages.push({ role: 'user', text: msg });
    this.userInput       = '';
    this.showSuggestions = false;

    const match = this.findMatch(msg);

    if (match) {
      const nav = this.resolveNav(match);

      if (nav.action === 'navigate') {
        // ✅ Navigate directly — no bot message shown
        this.showSuggestions = true;
        this.navigateTo(nav.route!);
        return;
      }

      if (nav.action === 'login-first') {
        // ❌ Not logged in / wrong role → show message + auto redirect to login
        this.messages.push({
          role:         'bot',
          text:         `🔒 You need to login as a ${nav.role} first to access "${nav.label}". Taking you to the Login page now!`,
          showLoginBtn: true
        });
        this.showSuggestions = true;
        this.scrollToBottom();
        setTimeout(() => this.navigateTo('/login'), 2000);
        return;
      }

      // Info-only entry → just show the answer
      this.messages.push({ role: 'bot', text: match.answer });
      this.showSuggestions = true;
      this.scrollToBottom();
      return;
    }

    // ── No local match → call Gemini API ─────────────────────────────────────
    this.isLoading = true;
    this.chatbotService.sendMessage(msg).subscribe({
      next: (res) => {
        this.messages.push({ role: 'bot', text: res.reply });
        this.isLoading       = false;
        this.showSuggestions = true;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ role: 'bot', text: '⚠️ Something went wrong. Please try again.' });
        this.isLoading       = false;
        this.showSuggestions = true;
      }
    });
  }

  onSuggestionClick(query: string) { this.userInput = query; this.sendMessage(); }

  navigateTo(route: string) { this.isOpen = false; this.router.navigate([route]); }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  clearChat() {
    this.messages        = [{ role: 'bot', text: "👋 Hi! I'm AgroLink Assistant. How can I help you today?" }];
    this.showSuggestions = true;
  }

  private scrollToBottom() {
    try { this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight; } catch {}
  }
}
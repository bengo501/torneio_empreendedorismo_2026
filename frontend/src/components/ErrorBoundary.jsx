import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Tourio Error]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position:'fixed', inset:0, background:'#1A1B2E',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:24, fontFamily:'Inter,sans-serif',
        }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
          <p style={{ color:'#3DED7A', fontWeight:900, fontSize:16, marginBottom:8 }}>
            Tourio encontrou um problema
          </p>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, textAlign:'center', marginBottom:24, maxWidth:280 }}>
            {this.state.error?.message ?? 'Erro desconhecido'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background:'#3DED7A', color:'#0A0A0A', border:'none', borderRadius:14, padding:'12px 28px', fontWeight:900, fontSize:14, cursor:'pointer' }}
          >
            Recarregar app
          </button>
          <details style={{ marginTop:24, color:'rgba(255,255,255,0.3)', fontSize:10, maxWidth:320, whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
            <summary style={{ cursor:'pointer', marginBottom:8 }}>Detalhes técnicos</summary>
            {this.state.error?.stack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

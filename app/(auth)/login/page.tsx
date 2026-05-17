import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <aside className="login-hero">
        <div className="flex items-center gap-3 relative z-[2]">
          <div
            className="brand-mark"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19V5l8 14L20 5v14" />
            </svg>
          </div>
          <div>
            <div className="serif font-semibold text-[18px]">PesquisaHub</div>
            <div className="text-[10.5px] opacity-70 tracking-[0.08em] uppercase">
              Pró-Reitoria de Pesquisa · UFOPA
            </div>
          </div>
        </div>

        <div className="relative z-[2]">
          <h1 className="serif font-normal text-[44px] leading-[1.05] tracking-[-0.02em]">
            A pesquisa
            <br />
            da universidade,
            <br />
            <em className="not-italic text-accent italic">em um só lugar.</em>
          </h1>
          <p className="mt-6 text-sm opacity-85 max-w-[460px] leading-relaxed">
            Gerencie projetos de Monitoria, PET, PIAPE, PIBIC e P&amp;D
            EMBRAPII — do cadastro à prestação de contas — com transparência
            para coordenadores, bolsistas e gestores.
          </p>
        </div>

        <div className="relative z-[2] flex gap-7 text-xs opacity-75">
          <div>
            <span className="serif tnum text-[22px] opacity-100 block">247</span>
            projetos ativos
          </div>
          <div>
            <span className="serif tnum text-[22px] opacity-100 block">
              R$ 18,4M
            </span>
            captados em 2025
          </div>
          <div>
            <span className="serif tnum text-[22px] opacity-100 block">
              1.842
            </span>
            bolsistas
          </div>
        </div>
      </aside>

      <div className="login-form-side">
        <div className="login-form">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

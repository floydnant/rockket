import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { AppComponent } from './app.component'

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
        }).compileComponents()
    })

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent)
        const app = fixture.componentInstance
        expect(app).toBeTruthy()
    })

    it("should have as title 'client-v2'", () => {
        const fixture = TestBed.createComponent(AppComponent)
        const app = fixture.componentInstance
        expect(app.title).toEqual('client-v2')
    })

    it('should render title', () => {
        const fixture = TestBed.createComponent(AppComponent)
        fixture.detectChanges()
        const compiled = fixture.nativeElement as HTMLElement
        expect(compiled.querySelector('.content span')?.textContent).toContain('client-v2 app is running!')
    })

    it('should display the app version', () => {
        const fixture = TestBed.createComponent(AppComponent)
        fixture.detectChanges()
        const compiled = fixture.nativeElement as HTMLElement
        expect(compiled.textContent).toContain('2.0.0')
    })
})

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CommandPalletteComponent } from './command-pallette.component'

describe('CommandPalletteComponent', () => {
    let component: CommandPalletteComponent
    let fixture: ComponentFixture<CommandPalletteComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommandPalletteComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(CommandPalletteComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CommandPaletteComponent } from './command-palette.component'

describe('CommandPaletteComponent', () => {
    let component: CommandPaletteComponent
    let fixture: ComponentFixture<CommandPaletteComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommandPaletteComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(CommandPaletteComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
